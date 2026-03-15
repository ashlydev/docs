import {
  getEmbeddingDescriptorFromEnv,
  getEnvWarnings,
  hasSupabaseConfig,
  env
} from "@/lib/env";
import { getProviderDescriptor, getProviderStatus } from "@/lib/ai-provider";
import { getSupabaseAdmin } from "@/lib/supabase";

async function getSupabaseStatus() {
  const configured = hasSupabaseConfig();
  const embedding = getEmbeddingDescriptorFromEnv();

  if (!configured) {
    return {
      configured,
      reachable: false,
      documentsIndexed: 0,
      activeChunksIndexed: 0,
      issues: ["Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."]
    };
  }

  try {
    const supabase = getSupabaseAdmin();
    const [{ count: documentCount, error: documentsError }, { count: chunkCount, error: chunksError }] =
      await Promise.all([
        supabase.from("documents").select("id", { count: "exact", head: true }),
        supabase
          .from("document_chunks")
          .select("id", { count: "exact", head: true })
          .contains("metadata", {
            embedding_model: embedding.model,
            embedding_provider: embedding.provider
          })
      ]);

    if (documentsError || chunksError) {
      return {
        configured,
        reachable: false,
        documentsIndexed: 0,
        activeChunksIndexed: 0,
        issues: [
          `Supabase check failed: ${
            documentsError?.message ?? chunksError?.message ?? "Unknown error"
          }`
        ]
      };
    }

    return {
      configured,
      reachable: true,
      documentsIndexed: documentCount ?? 0,
      activeChunksIndexed: chunkCount ?? 0,
      issues: [] as string[]
    };
  } catch (error) {
    return {
      configured,
      reachable: false,
      documentsIndexed: 0,
      activeChunksIndexed: 0,
      issues: [
        error instanceof Error
          ? `Supabase check failed: ${error.message}`
          : "Supabase check failed."
      ]
    };
  }
}

export async function getRuntimeStatus() {
  const [provider, providerStatus, supabase] = await Promise.all([
    Promise.resolve(getProviderDescriptor()),
    getProviderStatus(),
    getSupabaseStatus()
  ]);
  const envWarnings = getEnvWarnings();
  const knowledgeBaseReady =
    providerStatus.reachable &&
    providerStatus.chatModelAvailable &&
    providerStatus.embeddingModelAvailable &&
    supabase.reachable &&
    supabase.activeChunksIndexed > 0;
  const issues = [...envWarnings, ...providerStatus.issues, ...supabase.issues];

  return {
    status: issues.length === 0 && knowledgeBaseReady ? "ok" : "degraded",
    environment: {
      nodeEnv: env.NODE_ENV,
      vercelEnv: env.VERCEL_ENV ?? null,
      nextPublicAppUrlConfigured: Boolean(env.NEXT_PUBLIC_APP_URL),
      ingestionSecretConfigured: Boolean(env.INGESTION_SECRET),
      provider: provider.provider
    },
    provider: provider.provider,
    providerStatus,
    supabase,
    knowledgeBaseReady,
    issues
  };
}
