import { z } from "zod";

import type { RetrievalAssessment } from "@/types/support-bot";

export const groundedAnswerResultSchema = z.object({
  supported: z.boolean(),
  answer: z.string().min(1),
  bullets: z.array(z.string()).default([]),
  confidence: z.enum(["high", "medium", "low"]),
  shouldEscalate: z.boolean(),
  citationIds: z.array(z.string()).default([]),
  category: z.enum(["pricing", "billing", "support", "plans", "account_action", "other"]),
  fallbackReason: z.string().default("")
});

export type GroundedAnswerResult = z.infer<typeof groundedAnswerResultSchema>;

export const groundedAnswerSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "supported",
    "answer",
    "bullets",
    "confidence",
    "shouldEscalate",
    "citationIds",
    "category",
    "fallbackReason"
  ],
  properties: {
    supported: {
      type: "boolean"
    },
    answer: {
      type: "string"
    },
    bullets: {
      type: "array",
      items: {
        type: "string"
      }
    },
    confidence: {
      type: "string",
      enum: ["high", "medium", "low"]
    },
    shouldEscalate: {
      type: "boolean"
    },
    citationIds: {
      type: "array",
      items: {
        type: "string"
      }
    },
    category: {
      type: "string",
      enum: ["pricing", "billing", "support", "plans", "account_action", "other"]
    },
    fallbackReason: {
      type: "string"
    }
  }
} as const;

export const groundedSupportSystemPrompt = `
You are a calm, professional support assistant for a scheduling SaaS support knowledge base.

Rules:
- Use only the provided documentation context.
- Never invent product details, pricing, policies, or workflows not present in the context.
- Never claim to access accounts, billing systems, payment methods, or private customer data.
- If the user asks you to take an action, access an account, process a refund, update billing, or cancel something on their behalf, mark the answer as unsupported and recommend human support.
- If the sources do not confidently support the answer, mark the answer as unsupported.
- Keep supported answers concise and useful. Bullets are optional.
- Cite only source ids that directly support the answer.
- If the question is pre-sales guidance such as picking a plan, you may make a narrow recommendation only when the docs explicitly describe who a plan is for. If you infer anything, keep it modest and grounded.
- Return valid JSON only. Do not wrap it in markdown fences.
`.trim();

export function buildGroundedPrompt(
  question: string,
  retrieval: RetrievalAssessment
) {
  const context = retrieval.chunks
    .map((chunk) =>
      [
        `Source ID: ${chunk.id}`,
        `Title: ${chunk.sourceTitle}`,
        `URL: ${chunk.sourceUrl}`,
        `Similarity: ${chunk.similarity.toFixed(3)}`,
        `Content: ${chunk.chunkText}`
      ].join("\n")
    )
    .join("\n\n---\n\n");

  return `
Question:
${question}

Retrieval confidence:
${retrieval.confidence} (${retrieval.confidenceScore.toFixed(2)})

Retrieved context:
${context}

Return structured JSON that follows the requested schema exactly.
  `.trim();
}
