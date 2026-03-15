import { createHash } from "node:crypto";

import { embedText, getEmbeddingFingerprint } from "@/lib/ai-provider";
import { chunkDocument } from "@/lib/chunking";
import { extractReadableContent } from "@/lib/content-extractor";
import { getSupabaseAdmin } from "@/lib/supabase";
import { toVectorString } from "@/lib/vector";
import type { IngestResult, IngestSource } from "@/types/support-bot";

type IngestOptions = {
  force?: boolean;
};

function hashContent(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

async function createEmbeddings(texts: string[]) {
  const embeddings: number[][] = [];
  const batchSize = 32;

  for (let index = 0; index < texts.length; index += batchSize) {
    const batch = texts.slice(index, index + batchSize);
    embeddings.push(...(await embedText(batch)));
  }

  return embeddings;
}

async function insertChunkBatch(rows: Array<Record<string, unknown>>) {
  const supabase = getSupabaseAdmin();
  const batchSize = 100;

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    const { error } = await supabase.from("document_chunks").insert(batch);

    if (error) {
      throw new Error(error.message);
    }
  }
}

export async function ingestPublicSources(
  sources: IngestSource[],
  options: IngestOptions = {}
): Promise<IngestResult[]> {
  const results: IngestResult[] = [];

  for (const source of sources) {
    try {
      results.push(await ingestSingleSource(source, options));
    } catch (error) {
      results.push({
        url: source.url,
        title: source.title ?? source.label,
        chunks: 0,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown ingestion error."
      });
    }
  }

  return results;
}

async function ingestSingleSource(
  source: IngestSource,
  options: IngestOptions
): Promise<IngestResult> {
  const supabase = getSupabaseAdmin();
  const embedding = getEmbeddingFingerprint();
  const extracted = await extractReadableContent(source);
  const contentHash = hashContent(extracted.text);

  const { data: existingDocument, error: existingError } = await supabase
    .from("documents")
    .select("id, content_hash")
    .eq("source_url", source.url)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const { data: existingChunk, error: chunkMetadataError } = existingDocument?.id
    ? await supabase
        .from("document_chunks")
        .select("metadata")
        .eq("document_id", existingDocument.id)
        .limit(1)
        .maybeSingle()
    : { data: null, error: null };

  if (chunkMetadataError) {
    throw new Error(chunkMetadataError.message);
  }

  const existingFingerprint =
    existingChunk?.metadata &&
    typeof existingChunk.metadata === "object" &&
    "embedding_fingerprint" in existingChunk.metadata
      ? String(existingChunk.metadata.embedding_fingerprint)
      : null;

  if (
    existingDocument?.content_hash === contentHash &&
    existingFingerprint === embedding.fingerprint &&
    options.force !== true
  ) {
    return {
      url: source.url,
      title: extracted.sourceTitle,
      chunks: 0,
      status: "skipped"
    };
  }

  const { data: documentRow, error: documentError } = await supabase
    .from("documents")
    .upsert(
      {
        source_url: source.url,
        source_title: extracted.sourceTitle,
        source_domain: new URL(source.url).hostname,
        content_hash: contentHash,
        status: "ready",
        fetched_at: new Date().toISOString()
      },
      {
        onConflict: "source_url"
      }
    )
    .select("id")
    .single();

  if (documentError || !documentRow?.id) {
    throw new Error(documentError?.message ?? `Failed to upsert document ${source.url}`);
  }

  const chunks = chunkDocument(extracted.text);

  if (chunks.length === 0) {
    throw new Error(`No chunks generated for ${source.url}`);
  }

  const embeddings = await createEmbeddings(chunks.map((chunk) => chunk.text));

  if (embeddings.length !== chunks.length) {
    throw new Error(`Embedding count mismatch for ${source.url}`);
  }

  const { error: deleteError } = await supabase
    .from("document_chunks")
    .delete()
    .eq("document_id", documentRow.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const rows = chunks.map((chunk, index) => ({
    document_id: documentRow.id,
    source_url: source.url,
    source_title: extracted.sourceTitle,
    chunk_index: index,
    chunk_text: chunk.text,
    token_estimate: chunk.tokenEstimate,
    embedding: toVectorString(embeddings[index]),
    metadata: {
      label: source.label,
      embedding_fingerprint: embedding.fingerprint,
      embedding_model: embedding.model,
      embedding_provider: embedding.provider
    }
  }));

  await insertChunkBatch(rows);

  return {
    url: source.url,
    title: extracted.sourceTitle,
    chunks: rows.length,
    status: "ingested"
  };
}
