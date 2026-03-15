import { embedText, getEmbeddingFingerprint } from "@/lib/ai-provider";
import { getSupabaseAdmin } from "@/lib/supabase";
import { clamp } from "@/lib/utils";
import { toVectorString } from "@/lib/vector";
import type { RetrievedChunk, RetrievalAssessment } from "@/types/support-bot";

const DEFAULT_MATCH_COUNT = 6;
const DEFAULT_MATCH_THRESHOLD = 0.45;

type MatchDocumentChunkRow = {
  id: string;
  document_id: string;
  source_title: string;
  source_url: string;
  chunk_index: number;
  chunk_text: string;
  similarity: number;
};

export async function retrieveRelevantChunks(
  question: string
): Promise<RetrievedChunk[]> {
  const supabase = getSupabaseAdmin();
  const [queryEmbedding] = await embedText(question);
  const embedding = getEmbeddingFingerprint();

  if (!queryEmbedding) {
    return [];
  }

  const { data, error } = await supabase.rpc("match_document_chunks", {
    embedding_model: embedding.model,
    embedding_provider: embedding.provider,
    match_count: DEFAULT_MATCH_COUNT,
    match_threshold: DEFAULT_MATCH_THRESHOLD,
    query_embedding: toVectorString(queryEmbedding)
  });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as MatchDocumentChunkRow[]).map((row) => ({
    id: row.id,
    documentId: row.document_id,
    sourceTitle: row.source_title,
    sourceUrl: row.source_url,
    chunkIndex: row.chunk_index,
    chunkText: row.chunk_text,
    similarity: row.similarity
  }));
}

export function assessRetrieval(chunks: RetrievedChunk[]): RetrievalAssessment {
  if (chunks.length === 0) {
    return {
      confidence: "low",
      confidenceScore: 0.08,
      shouldFallback: true,
      rationale: [
        "No relevant chunks were retrieved from the active documentation index."
      ],
      chunks
    };
  }

  const topScore = chunks[0].similarity;
  const avgTopThree =
    chunks.slice(0, 3).reduce((sum, chunk) => sum + chunk.similarity, 0) /
    Math.min(chunks.length, 3);
  const strongMatches = chunks.filter((chunk) => chunk.similarity >= 0.63).length;
  const score = clamp(topScore * 0.68 + avgTopThree * 0.32);

  if (topScore < 0.54 || avgTopThree < 0.5) {
    return {
      confidence: "low",
      confidenceScore: score,
      shouldFallback: true,
      rationale: ["Retrieved evidence is too weak to support a safe grounded answer."],
      chunks
    };
  }

  if (topScore < 0.63 || strongMatches < 2) {
    return {
      confidence: "medium",
      confidenceScore: score,
      shouldFallback: false,
      rationale: ["Retrieved evidence is relevant but not especially dense or redundant."],
      chunks
    };
  }

  return {
    confidence: "high",
    confidenceScore: score,
    shouldFallback: false,
    rationale: ["Multiple retrieved chunks strongly support the question."],
    chunks
  };
}
