import {
  buildGroundedPrompt,
  groundedAnswerResultSchema,
  groundedAnswerSchema,
  groundedSupportSystemPrompt
} from "@/lib/prompts";
import { env, hasLlmConfig, isHostedOllamaUrlReady, isLocalUrl } from "@/lib/env";
import type { GroundedAnswerResult } from "@/lib/prompts";
import {
  AiProviderConfigurationError,
  AiProviderUnavailableError,
  type AiProviderAdapter,
  type ProviderStatus
} from "@/lib/providers/shared";

type OllamaEmbedResponse = {
  embedding?: number[];
  embeddings?: number[][];
};

type OllamaChatResponse = {
  message?: {
    content?: string;
  };
};

function normalizeBaseUrl() {
  return env.OLLAMA_BASE_URL.replace(/\/+$/, "");
}

function stripMarkdownFence(input: string) {
  const trimmed = input.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

function assertOllamaConfig() {
  if (!hasLlmConfig() || env.LLM_PROVIDER !== "ollama") {
    throw new AiProviderConfigurationError(
      "ollama",
      "OLLAMA_BASE_URL and Ollama model settings must be configured."
    );
  }
}

async function requestOllama<T>(path: string, body?: unknown, method = "POST"): Promise<T> {
  assertOllamaConfig();

  let response: Response;

  try {
    response = await fetch(`${normalizeBaseUrl()}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch (error) {
    throw new AiProviderUnavailableError(
      "ollama",
      error instanceof Error ? error.message : "Unable to reach Ollama."
    );
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Ollama request failed with ${response.status}: ${details || "Unknown error"}`
    );
  }

  return (await response.json()) as T;
}

export const ollamaProvider: AiProviderAdapter = {
  descriptor: {
    provider: "ollama",
    label: "Ollama",
    chatModel: env.OLLAMA_CHAT_MODEL,
    embeddingModel: env.OLLAMA_EMBEDDING_MODEL
  },

  async embedText(input: string | string[]) {
    const inputs = Array.isArray(input) ? input : [input];
    const payload = await requestOllama<OllamaEmbedResponse>("/api/embed", {
      model: env.OLLAMA_EMBEDDING_MODEL,
      input: inputs
    });

    const embeddings = Array.isArray(payload.embeddings)
      ? payload.embeddings
      : payload.embedding
        ? [payload.embedding]
        : [];

    if (embeddings.length !== inputs.length) {
      throw new Error("Ollama returned an unexpected embedding payload.");
    }

    return embeddings;
  },

  async generateStructuredAnswer({
    question,
    retrieval
  }): Promise<GroundedAnswerResult> {
    const payload = await requestOllama<OllamaChatResponse>("/api/chat", {
      model: env.OLLAMA_CHAT_MODEL,
      stream: false,
      format: groundedAnswerSchema,
      messages: [
        {
          role: "system",
          content: groundedSupportSystemPrompt
        },
        {
          role: "user",
          content: buildGroundedPrompt(question, retrieval)
        }
      ],
      options: {
        temperature: 0.1
      }
    });

    const content = payload.message?.content;

    if (!content) {
      throw new Error("Ollama returned an empty chat response.");
    }

    return groundedAnswerResultSchema.parse(JSON.parse(stripMarkdownFence(content)));
  },

  async getStatus(): Promise<ProviderStatus> {
    const configured = hasLlmConfig() && env.LLM_PROVIDER === "ollama";
    const issues: string[] = [];

    if (!configured) {
      return {
        configured,
        reachable: false,
        baseUrl: env.OLLAMA_BASE_URL,
        localOnlyUrl: isLocalUrl(env.OLLAMA_BASE_URL),
        hostedUrlReady: isHostedOllamaUrlReady(),
        chatModel: env.OLLAMA_CHAT_MODEL,
        chatModelAvailable: false,
        embeddingModel: env.OLLAMA_EMBEDDING_MODEL,
        embeddingModelAvailable: false,
        issues: ["Missing Ollama configuration."]
      };
    }

    try {
      const payload = await requestOllama<{
        models?: Array<{
          name?: string;
          model?: string;
        }>;
      }>("/api/tags", undefined, "GET");

      const availableModels = (payload.models ?? [])
        .flatMap((model) => [model.name, model.model])
        .filter((value): value is string => Boolean(value));
      const chatModelAvailable = availableModels.some(
        (model) =>
          model === env.OLLAMA_CHAT_MODEL ||
          model === `${env.OLLAMA_CHAT_MODEL}:latest` ||
          model.replace(/:latest$/, "") === env.OLLAMA_CHAT_MODEL
      );
      const embeddingModelAvailable = availableModels.some(
        (model) =>
          model === env.OLLAMA_EMBEDDING_MODEL ||
          model === `${env.OLLAMA_EMBEDDING_MODEL}:latest` ||
          model.replace(/:latest$/, "") === env.OLLAMA_EMBEDDING_MODEL
      );

      if (!chatModelAvailable) {
        issues.push(`Configured chat model "${env.OLLAMA_CHAT_MODEL}" was not found in Ollama.`);
      }

      if (!embeddingModelAvailable) {
        issues.push(
          `Configured embedding model "${env.OLLAMA_EMBEDDING_MODEL}" was not found in Ollama.`
        );
      }

      if (!isHostedOllamaUrlReady()) {
        issues.push(
          "Production deployments must point OLLAMA_BASE_URL at a reachable non-local host."
        );
      }

      return {
        configured,
        reachable: true,
        baseUrl: env.OLLAMA_BASE_URL,
        localOnlyUrl: isLocalUrl(env.OLLAMA_BASE_URL),
        hostedUrlReady: isHostedOllamaUrlReady(),
        chatModel: env.OLLAMA_CHAT_MODEL,
        chatModelAvailable,
        embeddingModel: env.OLLAMA_EMBEDDING_MODEL,
        embeddingModelAvailable,
        issues
      };
    } catch (error) {
      return {
        configured,
        reachable: false,
        baseUrl: env.OLLAMA_BASE_URL,
        localOnlyUrl: isLocalUrl(env.OLLAMA_BASE_URL),
        hostedUrlReady: isHostedOllamaUrlReady(),
        chatModel: env.OLLAMA_CHAT_MODEL,
        chatModelAvailable: false,
        embeddingModel: env.OLLAMA_EMBEDDING_MODEL,
        embeddingModelAvailable: false,
        issues: [
          error instanceof Error
            ? `Unable to reach Ollama: ${error.message}`
            : "Unable to reach Ollama."
        ]
      };
    }
  }
};
