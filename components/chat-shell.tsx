"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, Bot, LoaderCircle, SendHorizontal, ShieldCheck } from "lucide-react";

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
      <div className="max-w-[92%] rounded-[28px] border border-white/10 bg-white/[0.035] px-5 py-4 shadow-soft md:max-w-[86%]">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] text-sky-100">
            <Bot className="h-4 w-4" />
          </span>
          Support assistant
          <Badge className="ml-auto" variant="accent">
            thinking
          </Badge>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-3 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    </div>
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
    <Card className="panel flex h-[calc(100vh-2rem)] min-h-[640px] max-h-[820px] flex-col overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-0 sm:h-[calc(100vh-3rem)]">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-xl font-semibold text-text">{siteConfig.botName}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{siteConfig.botStatus}</p>
          </div>
          <Badge variant="success">citations on</Badge>
        </div>
      </div>

      <div className="border-b border-white/5 px-6 py-4">
        <div className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Grounded answers from the public knowledge base</span>
          <span className="inline-flex items-center gap-2 text-emerald-100/80">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            No account access
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 px-4 py-4 sm:px-6 sm:py-5">
        <div className="h-full min-h-0 overflow-y-auto pr-1 sm:pr-2" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-8 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sky-100">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <p className="mt-5 font-display text-2xl font-semibold text-text">
                Ask from the public knowledge base
              </p>
              <p className="mt-3 max-w-md text-sm leading-7 text-muted">
                {siteConfig.chatTrustLine}
              </p>
              <div className="mt-6 w-full max-w-lg rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-left">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  Common public-doc questions
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                  {siteConfig.emptyStateExamples.map((example) => (
                    <p key={example}>{example}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading ? <LoadingMessage /> : null}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 bg-[linear-gradient(180deg,rgba(5,12,22,0.55),rgba(5,12,22,0.92))] px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-5">
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submitQuestion();
          }}
        >
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-3 shadow-inset">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <Textarea
                className="min-h-[112px] resize-none border-transparent bg-transparent px-2 py-2 text-[15px] leading-6 focus:border-transparent focus:ring-0 md:min-h-[88px] md:flex-1"
                disabled={isLoading}
                maxLength={600}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Ask a question from the public knowledge base"
                rows={3}
                value={input}
              />
              <Button
                className="w-full shrink-0 md:min-w-[168px] md:w-auto"
                disabled={!canSubmit}
                size="lg"
                type="submit"
              >
                {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send question
                <SendHorizontal className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-xs leading-5 text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              Public docs only. Billing changes, cancellations, refunds, and private-data requests always route to support.
            </p>
            <span className="inline-flex items-center gap-2 text-emerald-100/80">
              <span>{input.length}/600</span>
            </span>
          </div>
        </form>
      </div>
    </Card>
  );
}
