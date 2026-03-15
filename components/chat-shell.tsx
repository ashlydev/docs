"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowUpRight,
  Bot,
  LoaderCircle,
  SendHorizontal,
  ShieldCheck
} from "lucide-react";

import { ChatMessage } from "@/components/chat-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/lib/site-config";
import type {
  ChatMessageRecord,
  ChatRequestPayload,
  ChatResponsePayload
} from "@/types/support-bot";

const fallbackNetworkMessage: ChatMessageRecord = {
  id: "network-fallback",
  role: "assistant",
  content: "The answer service is unavailable right now.",
  bullets: [],
  citations: [],
  fallbackTriggered: true,
  escalationSuggested: true,
  answerStatus: "fallback",
  confidence: "low",
  confidenceScore: 0.12,
  category: "other",
  supportLink: siteConfig.supportLink,
  fallbackReason: "service_unavailable"
};

function LoadingMessage() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[94%] rounded-[26px] border border-white/10 bg-surface-2/72 px-4 py-4 shadow-soft sm:px-5 md:max-w-[88%]">
        <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[#ead9bf]">
            <Bot className="h-4 w-4" />
          </span>
          Support assistant
          <Badge className="ml-auto" variant="accent">
            retrieving
          </Badge>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-3 w-32 animate-pulse rounded-full bg-white/10" />
          <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
          <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

type PromptSuggestionProps = {
  label: string;
  prompt: string;
  description: string;
  onSelect: (prompt: string) => void;
};

function PromptSuggestion({
  label,
  prompt,
  description,
  onSelect
}: PromptSuggestionProps) {
  return (
    <button
      className="group rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/16 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onClick={() => onSelect(prompt)}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            {label}
          </p>
          <p className="mt-2 text-sm font-semibold text-text">{prompt}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        </div>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted transition group-hover:border-white/20 group-hover:text-text">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}

export function ChatShell() {
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const trimmedInput = input.trim();
  const canSubmit = trimmedInput.length > 0 && !isLoading;

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, isLoading]);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void submitQuestion();
  };

  const submitQuestion = async (rawQuestion?: string) => {
    const question = (rawQuestion ?? input).trim();

    if (!question || isLoading) {
      return;
    }

    const userMessage: ChatMessageRecord = {
      id: crypto.randomUUID(),
      role: "user",
      content: question
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question
        } satisfies ChatRequestPayload)
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with ${response.status}`);
      }

      const payload = (await response.json()) as ChatResponsePayload;

      setMessages((current) => [
        ...current,
        {
          id: payload.id,
          role: "assistant",
          content: payload.answer,
          bullets: payload.bullets,
          citations: payload.citations,
          fallbackTriggered: payload.fallbackTriggered,
          escalationSuggested: payload.escalationSuggested,
          answerStatus: payload.answerStatus,
          confidence: payload.confidence,
          confidenceScore: payload.confidenceScore,
          category: payload.category,
          supportLink: payload.supportLink,
          fallbackReason: payload.fallbackReason
        }
      ]);
    } catch (error) {
      console.error("Failed to submit question", error);
      setMessages((current) => [
        ...current,
        {
          ...fallbackNetworkMessage,
          id: crypto.randomUUID()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="workspace-panel flex h-[82svh] min-h-[580px] max-h-[880px] flex-col overflow-hidden border-white/10 p-0 sm:min-h-[640px] lg:h-[840px]">
      <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-accent">
                <Bot className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-xl font-semibold text-text">{siteConfig.botName}</p>
                <p className="text-sm leading-6 text-muted">{siteConfig.botStatus}</p>
              </div>
            </div>
          </div>
          <Badge variant="success">Public docs only</Badge>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-muted">
            Grounded answers with source citations
          </div>
          <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-muted">
            Escalates billing changes and account-specific work
          </div>
          <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-muted">
            Built to reduce repetitive support questions
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] px-3 py-4 sm:px-5 sm:py-5">
        <div className="h-full min-h-0 overflow-y-auto pr-1" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex min-h-full items-center">
              <div className="mx-auto w-full max-w-3xl rounded-[28px] border border-dashed border-white/10 bg-background/20 px-4 py-8 sm:px-8 sm:py-10">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-accent">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  New conversation
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-text sm:text-4xl">
                  How can I help with the public support flow?
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-[15px]">
                  {siteConfig.chatTrustLine}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {siteConfig.suggestedPrompts.map((suggestion) => (
                    <PromptSuggestion
                      description={suggestion.description}
                      key={suggestion.prompt}
                      label={suggestion.label}
                      onSelect={(prompt) => {
                        void submitQuestion(prompt);
                      }}
                      prompt={suggestion.prompt}
                    />
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                    Grounded answers only when the docs support them
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                    Citations stay attached to supported answers
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-5 pb-2">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading ? <LoadingMessage /> : null}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 bg-surface/96 px-3 py-3 sm:px-5 sm:py-4">
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submitQuestion();
          }}
        >
          <div className="rounded-[26px] border border-white/10 bg-background/35 p-3">
            <Textarea
              className="min-h-[104px] resize-none border-transparent bg-transparent px-1 py-1 text-[15px] leading-6 focus:border-transparent focus:ring-0 sm:min-h-[92px]"
              disabled={isLoading}
              maxLength={600}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Ask about plans, invoices, billing policy, cancellation guidance, or support routing"
              rows={3}
              value={input}
            />

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-muted">
                Public docs only. Billing changes, cancellations, refunds, and private-data requests always route to support.
              </p>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="text-xs text-muted">{input.length}/600</span>
                <Button
                  className="min-w-[132px] sm:min-w-[150px]"
                  disabled={!canSubmit}
                  size="lg"
                  type="submit"
                >
                  {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send
                  <SendHorizontal className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
}
