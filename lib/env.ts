import { z } from "zod";

import type { SupportedLlmProvider } from "@/lib/providers/shared";

const localhostHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
const envWarnings: string[] = [];

function parseOptional<T>(key: string, schema: z.ZodType<T>) {
  const value = process.env[key];

  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = schema.safeParse(value);

  if (parsed.success) {
    return parsed.data;
  }

  envWarnings.push(`Invalid ${key} value detected. Ignoring it.`);
  return undefined;
}

function parseWithDefault<T>(key: string, schema: z.ZodType<T>, fallback: T) {
  return parseOptional(key, schema) ?? fallback;
}

const requestedProvider = parseOptional(
  "LLM_PROVIDER",
  z.enum(["ollama", "gemini", "openai"])
) as SupportedLlmProvider | undefined;

export const env = {
  LLM_PROVIDER: requestedProvider ?? "ollama",
  NEXT_PUBLIC_APP_URL: parseOptional("NEXT_PUBLIC_APP_URL", z.string().url()),
  NEXT_PUBLIC_SUPPORT_LINK: parseOptional(
    "NEXT_PUBLIC_SUPPORT_LINK",
    z.string().url()
  ),
  SUPPORT_LINK: parseOptional("SUPPORT_LINK", z.string().url()),
  NEXT_PUBLIC_TEARDOWN_LINK: parseWithDefault(
    "NEXT_PUBLIC_TEARDOWN_LINK",
    z.string().url(),
    "https://www.example.com/teardown"
  ),
  SUPABASE_URL: parseOptional("SUPABASE_URL", z.string().url()),
  SUPABASE_SERVICE_ROLE_KEY: parseOptional(
    "SUPABASE_SERVICE_ROLE_KEY",
    z.string().min(1)
  ),
  INGESTION_SECRET: parseOptional("INGESTION_SECRET", z.string().min(1)),
  OLLAMA_BASE_URL: parseWithDefault(
    "OLLAMA_BASE_URL",
    z.string().url(),
    "http://localhost:11434"
  ),
  OLLAMA_CHAT_MODEL: parseWithDefault(
    "OLLAMA_CHAT_MODEL",
    z.string().min(1),
    "gemma3:1b"
  ),
  OLLAMA_EMBEDDING_MODEL: parseWithDefault(
    "OLLAMA_EMBEDDING_MODEL",
    z.string().min(1),
    "embeddinggemma"
  ),
  GEMINI_API_KEY: parseOptional("GEMINI_API_KEY", z.string().min(1)),
  GEMINI_CHAT_MODEL: parseWithDefault(
    "GEMINI_CHAT_MODEL",
    z.string().min(1),
    "gemini-2.5-flash-lite"
  ),
  GEMINI_EMBEDDING_MODEL: parseWithDefault(
    "GEMINI_EMBEDDING_MODEL",
    z.string().min(1),
    "gemini-embedding-001"
  ),
  OPENAI_API_KEY: parseOptional("OPENAI_API_KEY", z.string().min(1)),
  OPENAI_CHAT_MODEL: parseWithDefault(
    "OPENAI_CHAT_MODEL",
    z.string().min(1),
    "gpt-4.1-nano"
  ),
  OPENAI_EMBEDDING_MODEL: parseWithDefault(
    "OPENAI_EMBEDDING_MODEL",
    z.string().min(1),
    "text-embedding-3-small"
  ),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  VERCEL_ENV: process.env.VERCEL_ENV
} as const;

export const supportLink =
  env.SUPPORT_LINK ??
  env.NEXT_PUBLIC_SUPPORT_LINK ??
  "https://www.example.com/support";

export function getEnvWarnings() {
  return [...envWarnings];
}

export function isProductionRuntime() {
  return env.NODE_ENV === "production" || env.VERCEL_ENV === "production";
}

export function isLocalUrl(value?: string) {
  if (!value) {
    return false;
  }

  try {
    return localhostHosts.has(new URL(value).hostname);
  } catch {
    return false;
  }
}

export function isHostedOllamaUrlReady() {
  if (env.LLM_PROVIDER !== "ollama") {
    return true;
  }

  return !isProductionRuntime() || !isLocalUrl(env.OLLAMA_BASE_URL);
}

export function getProviderDescriptorFromEnv() {
  if (env.LLM_PROVIDER === "gemini") {
    return {
      provider: "gemini" as const,
      label: "Gemini API",
      chatModel: env.GEMINI_CHAT_MODEL,
      embeddingModel: env.GEMINI_EMBEDDING_MODEL
    };
  }

  if (env.LLM_PROVIDER === "openai") {
    return {
      provider: "openai" as const,
      label: "OpenAI",
      chatModel: env.OPENAI_CHAT_MODEL,
      embeddingModel: env.OPENAI_EMBEDDING_MODEL
    };
  }

  return {
    provider: "ollama" as const,
    label: "Ollama",
    chatModel: env.OLLAMA_CHAT_MODEL,
    embeddingModel: env.OLLAMA_EMBEDDING_MODEL
  };
}

export function getEmbeddingDescriptorFromEnv() {
  const descriptor = getProviderDescriptorFromEnv();

  return {
    provider: descriptor.provider,
    model: descriptor.embeddingModel,
    fingerprint: `${descriptor.provider}:${descriptor.embeddingModel}`
  };
}

export function getLlmConfigIssues() {
  switch (env.LLM_PROVIDER) {
    case "gemini": {
      const issues: string[] = [];

      if (!env.GEMINI_API_KEY) {
        issues.push("GEMINI_API_KEY is missing.");
      }

      if (!env.GEMINI_CHAT_MODEL) {
        issues.push("GEMINI_CHAT_MODEL is missing.");
      }

      if (!env.GEMINI_EMBEDDING_MODEL) {
        issues.push("GEMINI_EMBEDDING_MODEL is missing.");
      }

      return issues;
    }
    case "openai": {
      const issues: string[] = [];

      if (!env.OPENAI_API_KEY) {
        issues.push("OPENAI_API_KEY is missing.");
      }

      if (!env.OPENAI_CHAT_MODEL) {
        issues.push("OPENAI_CHAT_MODEL is missing.");
      }

      if (!env.OPENAI_EMBEDDING_MODEL) {
        issues.push("OPENAI_EMBEDDING_MODEL is missing.");
      }

      return issues;
    }
    case "ollama": {
      const issues: string[] = [];

      if (!env.OLLAMA_BASE_URL) {
        issues.push("OLLAMA_BASE_URL is missing.");
      }

      if (!env.OLLAMA_CHAT_MODEL) {
        issues.push("OLLAMA_CHAT_MODEL is missing.");
      }

      if (!env.OLLAMA_EMBEDDING_MODEL) {
        issues.push("OLLAMA_EMBEDDING_MODEL is missing.");
      }

      if (isProductionRuntime() && isLocalUrl(env.OLLAMA_BASE_URL)) {
        issues.push(
          "OLLAMA_BASE_URL points to a local-only host. Hosted deployments need a reachable Ollama endpoint."
        );
      }

      return issues;
    }
    default:
      return [`Unsupported LLM_PROVIDER "${env.LLM_PROVIDER}".`];
  }
}

export function hasLlmConfig() {
  return getLlmConfigIssues().length === 0;
}

export function hasSupabaseConfig() {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

export function hasBackendConfig() {
  return hasLlmConfig() && hasSupabaseConfig();
}

export function getProviderConfigMessage() {
  if (env.LLM_PROVIDER === "gemini") {
    return "This support bot needs a configured knowledge base and valid Gemini API credentials before it can answer from the available docs.";
  }

  if (env.LLM_PROVIDER === "openai") {
    return "This support bot needs a configured knowledge base and valid OpenAI credentials before it can answer from the available docs.";
  }

  return "This support bot needs a configured knowledge base and a reachable Ollama endpoint before it can answer from the available docs.";
}

export function getProviderUnavailableMessage() {
  if (env.LLM_PROVIDER === "gemini") {
    return "The configured Gemini API service is unavailable right now. Please contact human support.";
  }

  if (env.LLM_PROVIDER === "openai") {
    return "The configured OpenAI service is unavailable right now. Please contact human support.";
  }

  return "The local Ollama service is unavailable right now. Please contact human support.";
}
