import { Bot, Sparkles } from "lucide-react";

import { CitationList } from "@/components/citation-list";
import { EscalationCard } from "@/components/escalation-card";
import { FallbackCard } from "@/components/fallback-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChatMessageRecord } from "@/types/support-bot";

type ChatMessageProps = {
  message: ChatMessageRecord;
};

function confidenceVariant(confidence?: ChatMessageRecord["confidence"]) {
  if (confidence === "high") {
    return "success";
  }

  if (confidence === "medium") {
    return "accent";
  }

  return "warning";
}

function shouldShowFallbackCard(message: ChatMessageRecord) {
  if (message.role === "user" || message.answerStatus !== "fallback") {
    return false;
  }

  return !["config_missing", "model_service_unavailable", "service_unavailable"].includes(
    message.fallbackReason ?? ""
  );
}

function shouldShowEscalationCard(message: ChatMessageRecord) {
  if (message.role === "user" || !message.supportLink) {
    return false;
  }

  if (message.answerStatus === "refused") {
    return true;
  }

  if (
    message.answerStatus === "fallback" &&
    ["model_service_unavailable", "service_unavailable"].includes(message.fallbackReason ?? "")
  ) {
    return true;
  }

  return message.answerStatus === "grounded" && message.escalationSuggested === true;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const showConfidenceBadge =
    !isUser && message.answerStatus === "grounded" && Boolean(message.confidence);

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[92%] rounded-[28px] border px-5 py-4 shadow-soft md:max-w-[86%]",
          isUser
            ? "border-sky-300/20 bg-sky-400/[0.12] text-sky-50"
            : "border-white/10 bg-white/[0.035] text-text"
        )}
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
          <span
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full",
              isUser ? "bg-sky-400/[0.15] text-sky-100" : "bg-white/[0.08] text-sky-100"
            )}
          >
            {isUser ? <Sparkles className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </span>
          {isUser ? "You" : "Support assistant"}
          {showConfidenceBadge ? (
            <Badge className="ml-auto" variant={confidenceVariant(message.confidence)}>
              {message.confidence} confidence
            </Badge>
          ) : null}
        </div>

        <div className="mt-4 space-y-4">
          <p className="whitespace-pre-wrap text-sm leading-7 md:text-[15px]">{message.content}</p>

          {message.bullets && message.bullets.length > 0 ? (
            <ul className="space-y-2 text-sm leading-6 text-muted">
              {message.bullets.map((bullet) => (
                <li className="flex gap-3" key={bullet}>
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {!isUser && message.citations ? <CitationList citations={message.citations} /> : null}
        {shouldShowFallbackCard(message) ? <FallbackCard /> : null}
        {shouldShowEscalationCard(message) ? (
          <EscalationCard supportLink={message.supportLink!} />
        ) : null}
      </div>
    </div>
  );
}
