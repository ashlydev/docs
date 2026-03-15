import OpenAI, {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  AuthenticationError,
  InternalServerError,
  PermissionDeniedError,
  RateLimitError
} from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import {
  buildGroundedPrompt,
  groundedAnswerResultSchema,
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

let client: OpenAI | null = null;

function getOpenAIClient() {
  if (!env.OPENAI_API_KEY) {
    throw new AiProviderConfigurationError(
      "openai",
      "OPENAI_API_KEY must be configured when LLM_PROVIDER=openai."
    );
  }

  client ??= new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    timeout: 12_000
  });

  return client;
}

function toProviderError(error: unknown) {
  if (
    error instanceof AiProviderConfigurationError ||
    error instanceof AiProviderUnavailableError
  ) {
    return error;
  }

  if (
    error instanceof APIConnectionError ||
    error instanceof APIConnectionTimeoutError ||
    error instanceof AuthenticationError ||
    error instanceof PermissionDeniedError ||
    error instanceof RateLimitError ||
    error instanceof InternalServerError
  ) {
    return new AiProviderUnavailableError("openai", error.message);
  }

  if (error instanceof APIError) {
    return new Error(`OpenAI request failed with ${error.status}: ${error.message}`);
  }

  return error instanceof Error ? error : new Error("OpenAI request failed.");
}

function assertOpenAIConfig() {
  if (!hasLlmConfig() || env.LLM_PROVIDER !== "openai") {
    throw new AiProviderConfigurationError(
      "openai",
      "OPENAI_API_KEY and OpenAI model settings must be configured."
    );
  }
}

export const openAIProvider: AiProviderAdapter = {
  descriptor: {
    provider: "openai",
    label: "OpenAI",
    chatModel: env.OPENAI_CHAT_MODEL,
    embeddingModel: env.OPENAI_EMBEDDING_MODEL
  },

  async embedText(input: string | string[]) {
    assertOpenAIConfig();

    try {
      const response = await getOpenAIClient().embeddings.create({
        model: env.OPENAI_EMBEDDING_MODEL,
        input: Array.isArray(input) ? input : [input]
      });

      return response.data.map((item) => item.embedding);
    } catch (error) {
      throw toProviderError(error);
    }
  },

  async generateStructuredAnswer({
    question,
    retrieval
  }): Promise<GroundedAnswerResult> {
    assertOpenAIConfig();

    try {
      const completion = await getOpenAIClient().chat.completions.parse({
        model: env.OPENAI_CHAT_MODEL,
        temperature: 0.1,
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
        response_format: zodResponseFormat(
          groundedAnswerResultSchema,
          "grounded_support_answer"
        )
      });

      const parsed = completion.choices[0]?.message?.parsed;

      if (!parsed) {
        throw new Error("OpenAI returned an empty structured answer.");
      }

      return groundedAnswerResultSchema.parse(parsed);
    } catch (error) {
      throw toProviderError(error);
    }
  },

  async getStatus(): Promise<ProviderStatus> {
    const configured = hasLlmConfig() && env.LLM_PROVIDER === "openai";

    if (!configured) {
      return {
        configured,
        reachable: false,
        chatModel: env.OPENAI_CHAT_MODEL,
        chatModelAvailable: false,
        embeddingModel: env.OPENAI_EMBEDDING_MODEL,
        embeddingModelAvailable: false,
        issues:
          env.LLM_PROVIDER === "openai"
            ? getLlmConfigIssues()
            : ["LLM_PROVIDER is not set to openai."]
      };
    }

    try {
      const [chatModel, embeddingModel] = await Promise.all([
        getOpenAIClient().models.retrieve(env.OPENAI_CHAT_MODEL, {
          timeout: 5_000
        }),
        getOpenAIClient().models.retrieve(env.OPENAI_EMBEDDING_MODEL, {
          timeout: 5_000
        })
      ]);

      return {
        configured,
        reachable: true,
        chatModel: env.OPENAI_CHAT_MODEL,
        chatModelAvailable: Boolean(chatModel.id),
        embeddingModel: env.OPENAI_EMBEDDING_MODEL,
        embeddingModelAvailable: Boolean(embeddingModel.id),
        issues: []
      };
    } catch (error) {
      const providerError = toProviderError(error);

      return {
        configured,
        reachable: false,
        chatModel: env.OPENAI_CHAT_MODEL,
        chatModelAvailable: false,
        embeddingModel: env.OPENAI_EMBEDDING_MODEL,
        embeddingModelAvailable: false,
        issues: [providerError.message]
      };
    }
  }
};
