import { Bot, User } from "lucide-react";

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
          "max-w-[94%] rounded-[26px] border px-4 py-4 shadow-soft sm:px-5 md:max-w-[88%]",
          isUser
            ? "border-[rgba(204,176,137,0.22)] bg-[rgba(204,176,137,0.09)] text-text"
            : "border-white/10 bg-surface-2/72 text-text"
        )}
      >
        <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          <span
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full border",
              isUser
                ? "border-[rgba(204,176,137,0.2)] bg-[rgba(204,176,137,0.08)] text-[#ead9bf]"
                : "border-white/10 bg-white/[0.05] text-[#ead9bf]"
            )}
          >
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </span>
          <span>{isUser ? "You" : "Support assistant"}</span>
          {showConfidenceBadge ? (
            <Badge className="ml-auto" variant={confidenceVariant(message.confidence)}>
              {message.confidence} confidence
            </Badge>
          ) : null}
        </div>

        <div className="mt-4 space-y-4">
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-text">
            {message.content}
          </p>

          {message.bullets && message.bullets.length > 0 ? (
            <ul className="space-y-2.5 text-sm leading-7 text-muted">
              {message.bullets.map((bullet) => (
                <li className="flex gap-3" key={bullet}>
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-accent" />
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
