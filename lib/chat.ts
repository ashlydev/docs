import { randomUUID } from "node:crypto";

import {
  AiProviderUnavailableError,
  generateStructuredAnswer,
  getProviderDescriptor
} from "@/lib/ai-provider";
import { logChatInteraction } from "@/lib/analytics";
import {
  getProviderConfigMessage,
  getProviderUnavailableMessage,
  hasBackendConfig,
  supportLink
} from "@/lib/env";
import {
  groundedAnswerResultSchema
} from "@/lib/prompts";
import { retrieveRelevantChunks, assessRetrieval } from "@/lib/retrieval";
import { clamp, dedupeBy, truncate } from "@/lib/utils";
import type {
  AnswerConfidence,
  AnswerStatus,
  ChatResponsePayload,
  QuestionCategory,
  RetrievalAssessment
} from "@/types/support-bot";

const actionRequestRegex =
  /\b(can you|could you|would you|please|for me|on my behalf|access my|refund me|cancel my|update my|change my|modify my)\b/i;
const actionTargetRegex =
  /\b(cancel|refund|update|change|modify|edit|delete|access|charge|reset|downgrade|upgrade)\b/i;
const privateScopeRegex =
  /\b(account|subscription|card|payment method|billing info|billing information|billing detail|billing details|invoice|seat count)\b/i;
const directRestrictedActionRegex =
  /\b(refund me|cancel my|access my account|change my billing|change my billing details|update my billing|update my card|change my card|modify my billing)\b/i;

function isAccountActionRequest(question: string) {
  if (directRestrictedActionRegex.test(question)) {
    return true;
  }

  return actionRequestRegex.test(question) &&
    actionTargetRegex.test(question) &&
    privateScopeRegex.test(question);
}

function confidenceToScore(confidence: AnswerConfidence) {
  switch (confidence) {
    case "high":
      return 0.9;
    case "medium":
      return 0.72;
    default:
      return 0.28;
  }
}

const refusalMessage =
  "I can't perform account actions or access private account data from the available documentation. Please contact support for billing changes, cancellations, refunds, or account-specific help.";
const lowConfidenceMessage =
  "I'm not confident enough to answer that from the available documentation.";

function buildFallbackResponse({
  answer,
  answerStatus,
  category,
  fallbackReason,
  escalationSuggested = true,
  confidence = "low",
  confidenceScore = 0.22
}: {
  answer: string;
  answerStatus: AnswerStatus;
  category: QuestionCategory;
  fallbackReason: string;
  escalationSuggested?: boolean;
  confidence?: AnswerConfidence;
  confidenceScore?: number;
}): ChatResponsePayload {
  return {
    id: randomUUID(),
    answer,
    bullets: [],
    citations: [],
    answerStatus,
    fallbackTriggered: answerStatus === "fallback",
    escalationSuggested,
    confidence,
    confidenceScore,
    category,
    supportLink,
    fallbackReason
  };
}

function mergeConfidence(
  retrieval: RetrievalAssessment,
  modelConfidence: AnswerConfidence
): {
  confidence: AnswerConfidence;
  confidenceScore: number;
} {
  const combinedScore = clamp(
    retrieval.confidenceScore * 0.58 + confidenceToScore(modelConfidence) * 0.42
  );

  if (retrieval.confidence === "low" || modelConfidence === "low") {
    return {
      confidence: "low",
      confidenceScore: combinedScore
    };
  }

  if (retrieval.confidence === "medium" || modelConfidence === "medium") {
    return {
      confidence: "medium",
      confidenceScore: combinedScore
    };
  }

  return {
    confidence: "high",
    confidenceScore: combinedScore
  };
}

function citationsFromIds(
  citationIds: string[],
  retrieval: RetrievalAssessment
) {
  const idSet = new Set(citationIds);

  const selected = retrieval.chunks.filter((chunk) => idSet.has(chunk.id));

  return dedupeBy(selected, (chunk) => chunk.sourceUrl)
    .slice(0, 3)
    .map((chunk) => ({
      id: chunk.id,
      sourceTitle: chunk.sourceTitle,
      sourceUrl: chunk.sourceUrl,
      snippet: truncate(chunk.chunkText, 220),
      similarity: chunk.similarity
    }));
}

export async function answerSupportQuestion(
  question: string
): Promise<ChatResponsePayload> {
  const cleanedQuestion = question.trim();

  if (!cleanedQuestion) {
    throw new Error("Question cannot be empty.");
  }

  let heuristicFlags: string[] = [];
  let response: ChatResponsePayload;

  if (isAccountActionRequest(cleanedQuestion)) {
    response = buildFallbackResponse({
      answer: refusalMessage,
      answerStatus: "refused",
      category: "account_action",
      fallbackReason: "account_action",
      escalationSuggested: true,
      confidenceScore: 0.12
    });

    await logChatInteraction({
      question: cleanedQuestion,
      response,
      heuristicFlags: ["Account-specific action request detected."]
    });

    return response;
  }

  if (!hasBackendConfig()) {
    const provider = getProviderDescriptor();
    response = buildFallbackResponse({
      answer: getProviderConfigMessage(),
      answerStatus: "fallback",
      category: "other",
      fallbackReason: "config_missing",
      escalationSuggested: false,
      confidenceScore: 0.05
    });

    await logChatInteraction({
      question: cleanedQuestion,
      response,
      heuristicFlags: [
        `Missing knowledge-base configuration for ${provider.label}.`
      ]
    });

    return response;
  }

  try {
    const chunks = await retrieveRelevantChunks(cleanedQuestion);
    const retrieval = assessRetrieval(chunks);
    heuristicFlags = retrieval.rationale;

    if (retrieval.shouldFallback) {
      response = buildFallbackResponse({
        answer: lowConfidenceMessage,
        answerStatus: "fallback",
        category: "other",
        fallbackReason: "weak_retrieval",
        escalationSuggested: false,
        confidenceScore: retrieval.confidenceScore
      });

      await logChatInteraction({
        question: cleanedQuestion,
        response,
        heuristicFlags
      });

      return response;
    }

    const generated = groundedAnswerResultSchema.parse(
      await generateStructuredAnswer({
        question: cleanedQuestion,
        retrieval
      })
    );
    const citations = citationsFromIds(generated.citationIds, retrieval);
    const mergedConfidence = mergeConfidence(retrieval, generated.confidence);

    if (
      !generated.supported ||
      mergedConfidence.confidence === "low" ||
      citations.length === 0
    ) {
      response = buildFallbackResponse({
        answer: lowConfidenceMessage,
        answerStatus: "fallback",
        category: generated.category,
        fallbackReason:
          generated.fallbackReason || "insufficient_evidence_after_generation",
        escalationSuggested: false,
        confidenceScore: mergedConfidence.confidenceScore
      });

      await logChatInteraction({
        question: cleanedQuestion,
        response,
        heuristicFlags: [...heuristicFlags, "Model confidence or citations were insufficient."]
      });

      return response;
    }

    response = {
      id: randomUUID(),
      answer: generated.answer,
      bullets: generated.bullets.slice(0, 4),
      citations,
      answerStatus: "grounded",
      fallbackTriggered: false,
      escalationSuggested:
        generated.shouldEscalate || mergedConfidence.confidence === "medium",
      confidence: mergedConfidence.confidence,
      confidenceScore: mergedConfidence.confidenceScore,
      category: generated.category,
      supportLink,
      fallbackReason: generated.fallbackReason
    };

    await logChatInteraction({
      question: cleanedQuestion,
      response,
      heuristicFlags
    });

    return response;
  } catch (error) {
    console.error("Failed to answer question", error);

    if (error instanceof AiProviderUnavailableError) {
      response = buildFallbackResponse({
        answer: getProviderUnavailableMessage(),
        answerStatus: "fallback",
        category: "other",
        fallbackReason: "model_service_unavailable",
        escalationSuggested: true,
        confidenceScore: 0.08
      });

      await logChatInteraction({
        question: cleanedQuestion,
        response,
        heuristicFlags: [...heuristicFlags, `${error.provider} was unavailable.`]
      });

      return response;
    }

    response = buildFallbackResponse({
      answer: lowConfidenceMessage,
      answerStatus: "fallback",
      category: "other",
      fallbackReason: "generation_error",
      escalationSuggested: false,
      confidenceScore: 0.18
    });

    await logChatInteraction({
      question: cleanedQuestion,
      response,
      heuristicFlags: [...heuristicFlags, "The generation pipeline encountered an error."]
    });

    return response;
  }
}
