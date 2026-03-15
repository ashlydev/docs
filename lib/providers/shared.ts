import type { GroundedAnswerResult } from "@/lib/prompts";
import type { RetrievalAssessment } from "@/types/support-bot";

export type SupportedLlmProvider = "ollama" | "gemini" | "openai";

export type GenerateStructuredAnswerArgs = {
  question: string;
  retrieval: RetrievalAssessment;
};

export type ProviderDescriptor = {
  provider: SupportedLlmProvider;
  label: string;
  chatModel: string;
  embeddingModel: string;
};

export type ProviderStatus = {
  configured: boolean;
  reachable: boolean;
  chatModel: string;
  chatModelAvailable: boolean;
  embeddingModel: string;
  embeddingModelAvailable: boolean;
  issues: string[];
  baseUrl?: string;
  localOnlyUrl?: boolean;
  hostedUrlReady?: boolean;
};

export interface AiProviderAdapter {
  descriptor: ProviderDescriptor;
  embedText(input: string | string[]): Promise<number[][]>;
  generateStructuredAnswer(
    args: GenerateStructuredAnswerArgs
  ): Promise<GroundedAnswerResult>;
  getStatus(): Promise<ProviderStatus>;
}

export class AiProviderUnavailableError extends Error {
  provider: SupportedLlmProvider;

  constructor(provider: SupportedLlmProvider, message: string) {
    super(message);
    this.name = "AiProviderUnavailableError";
    this.provider = provider;
  }
}

export class AiProviderConfigurationError extends Error {
  provider: SupportedLlmProvider | "unknown";

  constructor(provider: SupportedLlmProvider | "unknown", message: string) {
    super(message);
    this.name = "AiProviderConfigurationError";
    this.provider = provider;
  }
}
