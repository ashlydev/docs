export type AnswerStatus = "grounded" | "fallback" | "refused";

export type AnswerConfidence = "high" | "medium" | "low";

export type QuestionCategory =
  | "pricing"
  | "billing"
  | "support"
  | "plans"
  | "account_action"
  | "other";

export type Citation = {
  id: string;
  sourceTitle: string;
  sourceUrl: string;
  snippet: string;
  similarity?: number;
};

export type ChatMessageRecord = {
  id: string;
  role: "user" | "assistant";
  content: string;
  bullets?: string[];
  citations?: Citation[];
  fallbackTriggered?: boolean;
  escalationSuggested?: boolean;
  answerStatus?: AnswerStatus;
  confidence?: AnswerConfidence;
  confidenceScore?: number;
  category?: QuestionCategory;
  supportLink?: string;
};

export type ChatResponsePayload = {
  id: string;
  answer: string;
  bullets: string[];
  citations: Citation[];
  answerStatus: AnswerStatus;
  fallbackTriggered: boolean;
  escalationSuggested: boolean;
  confidence: AnswerConfidence;
  confidenceScore: number;
  category: QuestionCategory;
  supportLink: string;
  fallbackReason?: string;
};

export type ChatRequestPayload = {
  question: string;
};

export type RetrievedChunk = {
  id: string;
  documentId: string;
  sourceTitle: string;
  sourceUrl: string;
  chunkIndex: number;
  chunkText: string;
  similarity: number;
};

export type RetrievalAssessment = {
  confidence: AnswerConfidence;
  confidenceScore: number;
  shouldFallback: boolean;
  rationale: string[];
  chunks: RetrievedChunk[];
};

export type AnalyticsSummary = {
  questionsAnswered: number;
  fallbackRate: number;
  escalationsTriggered: number;
  topCategories: Array<{
    label: string;
    count: number;
  }>;
  mode: "live" | "demo";
};

export type IngestSource =
  | {
      kind?: "url";
      label: string;
      url: string;
      title?: string;
    }
  | {
      kind: "file";
      label: string;
      url: string;
      filePath: string;
      title?: string;
    };

export type SourceSet = {
  key: string;
  label: string;
  description: string;
  reviewHref?: string;
  reviewLabel?: string;
  sources: IngestSource[];
};

export type IngestResult = {
  url: string;
  title: string;
  chunks: number;
  status: "ingested" | "skipped" | "failed";
  error?: string;
};
