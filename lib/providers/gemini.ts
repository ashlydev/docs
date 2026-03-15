import { ApiError, GoogleGenAI } from "@google/genai";

import {
  buildGroundedPrompt,
  groundedAnswerResultSchema,
  groundedAnswerSchema,
  groundedSupportSystemPrompt
} from "@/lib/prompts";
import { env, getLlmConfigIssues, hasLlmConfig } from "@/lib/env";
import type { GroundedAnswerResult } from "@/lib/prompts";
import {
  AiProviderConfigurationError,
  AiProviderUnavailableError,
  type AiProviderAdapter,
  type ProviderStatus
} from "@/lib/providers/shared";

let client: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!env.GEMINI_API_KEY) {
    throw new AiProviderConfigurationError(
      "gemini",
      "GEMINI_API_KEY must be configured when LLM_PROVIDER=gemini."
    );
  }

  client ??= new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY
  });

  return client;
}

function assertGeminiConfig() {
  if (!hasLlmConfig() || env.LLM_PROVIDER !== "gemini") {
    throw new AiProviderConfigurationError(
      "gemini",
      "GEMINI_API_KEY and Gemini model settings must be configured."
    );
  }
}

function toProviderError(error: unknown) {
  if (
    error instanceof AiProviderConfigurationError ||
    error instanceof AiProviderUnavailableError
  ) {
    return error;
  }

  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403 || error.status === 429 || error.status >= 500) {
      return new AiProviderUnavailableError("gemini", error.message);
    }

    return new Error(`Gemini request failed with ${error.status}: ${error.message}`);
  }

  if (error instanceof Error && /fetch|network|timed out|timeout/i.test(error.message)) {
    return new AiProviderUnavailableError("gemini", error.message);
  }

  return error instanceof Error ? error : new Error("Gemini request failed.");
}

function stripMarkdownFence(input: string) {
  const trimmed = input.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

export const geminiProvider: AiProviderAdapter = {
  descriptor: {
    provider: "gemini",
    label: "Gemini API",
    chatModel: env.GEMINI_CHAT_MODEL,
    embeddingModel: env.GEMINI_EMBEDDING_MODEL
  },

  async embedText(input: string | string[]) {
    assertGeminiConfig();

    const contents = Array.isArray(input) ? input : [input];

    try {
      const response = await getGeminiClient().models.embedContent({
        model: env.GEMINI_EMBEDDING_MODEL,
        contents,
        config: {
          taskType: Array.isArray(input) ? "RETRIEVAL_DOCUMENT" : "RETRIEVAL_QUERY"
        }
      });

      const embeddings = (response.embeddings ?? []).map((item) => item.values ?? []);

      if (embeddings.length !== contents.length || embeddings.some((values) => values.length === 0)) {
        throw new Error("Gemini returned an unexpected embedding payload.");
      }

      return embeddings;
    } catch (error) {
      throw toProviderError(error);
    }
  },

  async generateStructuredAnswer({
    question,
    retrieval
  }): Promise<GroundedAnswerResult> {
    assertGeminiConfig();

    try {
      const response = await getGeminiClient().models.generateContent({
        model: env.GEMINI_CHAT_MODEL,
        contents: buildGroundedPrompt(question, retrieval),
        config: {
          systemInstruction: groundedSupportSystemPrompt,
          temperature: 0.1,
          responseMimeType: "application/json",
          responseJsonSchema: groundedAnswerSchema
        }
      });

      const content = response.text;

      if (!content) {
        throw new Error("Gemini returned an empty structured answer.");
      }

      return groundedAnswerResultSchema.parse(JSON.parse(stripMarkdownFence(content)));
    } catch (error) {
      throw toProviderError(error);
    }
  },

  async getStatus(): Promise<ProviderStatus> {
    const configured = hasLlmConfig() && env.LLM_PROVIDER === "gemini";

    if (!configured) {
      return {
        configured,
        reachable: false,
        chatModel: env.GEMINI_CHAT_MODEL,
        chatModelAvailable: false,
        embeddingModel: env.GEMINI_EMBEDDING_MODEL,
        embeddingModelAvailable: false,
        issues:
          env.LLM_PROVIDER === "gemini"
            ? getLlmConfigIssues()
            : ["LLM_PROVIDER is not set to gemini."]
      };
    }

    try {
      const [chatModel, embeddingModel] = await Promise.all([
        getGeminiClient().models.get({
          model: env.GEMINI_CHAT_MODEL
        }),
        getGeminiClient().models.get({
          model: env.GEMINI_EMBEDDING_MODEL
        })
      ]);

      return {
        configured,
        reachable: true,
        chatModel: env.GEMINI_CHAT_MODEL,
        chatModelAvailable: Boolean(chatModel.name),
        embeddingModel: env.GEMINI_EMBEDDING_MODEL,
        embeddingModelAvailable: Boolean(embeddingModel.name),
        issues: []
      };
    } catch (error) {
      const providerError = toProviderError(error);

      return {
        configured,
        reachable: false,
        chatModel: env.GEMINI_CHAT_MODEL,
        chatModelAvailable: false,
        embeddingModel: env.GEMINI_EMBEDDING_MODEL,
        embeddingModelAvailable: false,
        issues: [providerError.message]
      };
    }
  }
};
