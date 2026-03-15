import { env } from "@/lib/env";
import { geminiProvider } from "@/lib/providers/gemini";
import { ollamaProvider } from "@/lib/providers/ollama";
import { openAIProvider } from "@/lib/providers/openai";
import {
  AiProviderConfigurationError,
  AiProviderUnavailableError,
  type GenerateStructuredAnswerArgs,
  type ProviderDescriptor,
  type ProviderStatus,
  type SupportedLlmProvider
} from "@/lib/providers/shared";

function resolveProvider() {
  switch (env.LLM_PROVIDER) {
    case "ollama":
      return ollamaProvider;
    case "gemini":
      return geminiProvider;
    case "openai":
      return openAIProvider;
    default:
      throw new AiProviderConfigurationError(
        "unknown",
        `Unsupported LLM_PROVIDER "${env.LLM_PROVIDER}".`
      );
  }
}

export function getProviderName(): SupportedLlmProvider {
  return resolveProvider().descriptor.provider;
}

export function getProviderDescriptor(): ProviderDescriptor {
  return resolveProvider().descriptor;
}

export function getEmbeddingFingerprint() {
  const descriptor = getProviderDescriptor();

  return {
    provider: descriptor.provider,
    model: descriptor.embeddingModel,
    fingerprint: `${descriptor.provider}:${descriptor.embeddingModel}`
  };
}

export async function getProviderStatus(): Promise<ProviderStatus> {
  return resolveProvider().getStatus();
}

export async function embedText(input: string | string[]) {
  return resolveProvider().embedText(input);
}

export async function generateStructuredAnswer(args: GenerateStructuredAnswerArgs) {
  return resolveProvider().generateStructuredAnswer(args);
}

export { AiProviderConfigurationError, AiProviderUnavailableError };
