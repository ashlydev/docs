"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import {
  ArrowUpRight,
  Bot,
  CircleAlert,
  LoaderCircle,
  SendHorizontal,
  ShieldCheck
} from "lucide-react";

import { ChatMessage } from "@/components/chat-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createClientMessageId } from "@/lib/client-id";
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

type ChatShellStoreState = {
  messages: ChatMessageRecord[];
  input: string;
  isLoading: boolean;
  submitError: string | null;
  activeSubmissionId: string | null;
};

const initialChatShellStoreState: ChatShellStoreState = {
  messages: [],
  input: "",
  isLoading: false,
  submitError: null,
  activeSubmissionId: null
};

let chatShellStoreState: ChatShellStoreState = initialChatShellStoreState;

const chatShellListeners = new Set<(state: ChatShellStoreState) => void>();

function logChatEvent(event: string, details?: Record<string, unknown>) {
  if (details) {
    console.info("[chat-shell]", event, details);
    return;
  }

  console.info("[chat-shell]", event);
}

function readChatShellStore() {
  return chatShellStoreState;
}

function updateChatShellStore(
  updater: (state: ChatShellStoreState) => ChatShellStoreState
) {
  chatShellStoreState = updater(chatShellStoreState);

  for (const listener of chatShellListeners) {
    listener(chatShellStoreState);
  }

  return chatShellStoreState;
}

function subscribeToChatShellStore(listener: (state: ChatShellStoreState) => void) {
  chatShellListeners.add(listener);

  return () => {
    chatShellListeners.delete(listener);
  };
}

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
  const [chatState, setChatState] = useState<ChatShellStoreState>(() => readChatShellStore());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const shellInstanceIdRef = useRef(createClientMessageId("shell"));
  const { messages, input, isLoading, submitError, activeSubmissionId } = chatState;
  const trimmedInput = input.trim();
  const canSubmit = trimmedInput.length > 0 && !isLoading;

  useEffect(() => {
    const shellInstanceId = shellInstanceIdRef.current;

    logChatEvent("shell-mounted", {
      shellInstanceId,
      messageCount: readChatShellStore().messages.length,
      isLoading: readChatShellStore().isLoading
    });

    const unsubscribe = subscribeToChatShellStore((nextState) => {
      setChatState(nextState);
    });

    return () => {
      unsubscribe();
      logChatEvent("shell-unmounted", {
        shellInstanceId,
        messageCount: readChatShellStore().messages.length,
        isLoading: readChatShellStore().isLoading
      });
    };
  }, []);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, isLoading]);

  useEffect(() => {
    const viewport = window.visualViewport;

    if (!viewport) {
      return;
    }

    const handleViewportChange = () => {
      logChatEvent("viewport-changed", {
        width: viewport.width,
        height: viewport.height,
        offsetTop: viewport.offsetTop
      });

      if (document.activeElement instanceof HTMLTextAreaElement) {
        composerRef.current?.scrollIntoView({
          block: "end"
        });
      }
    };

    viewport.addEventListener("resize", handleViewportChange);
    viewport.addEventListener("scroll", handleViewportChange);

    return () => {
      viewport.removeEventListener("resize", handleViewportChange);
      viewport.removeEventListener("scroll", handleViewportChange);
    };
  }, []);

  useEffect(() => {
    const latestMessage =
      messages.length > 0 ? messages[messages.length - 1] : undefined;

    logChatEvent("messages-rendered", {
      count: messages.length,
      lastRole: latestMessage?.role ?? null,
      lastStatus: latestMessage?.answerStatus ?? null
    });
  }, [messages]);

  useEffect(() => {
    if (!submitError) {
      return;
    }

    logChatEvent("submit-error-visible", {
      submitError
    });
  }, [submitError]);

  const revealComposer = () => {
    requestAnimationFrame(() => {
      composerRef.current?.scrollIntoView({
        block: "end",
        behavior: "smooth"
      });
    });
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void submitQuestion();
  };

  const submitQuestion = async (rawQuestion?: string) => {
    const currentState = readChatShellStore();
    const question = (rawQuestion ?? currentState.input).trim();

    if (!question || currentState.isLoading || currentState.activeSubmissionId) {
      logChatEvent("submit-skipped", {
        hasQuestion: Boolean(question),
        isLoading: currentState.isLoading,
        activeSubmissionId: currentState.activeSubmissionId
      });
      return;
    }

    const submissionId = createClientMessageId("submit");
    const userMessage: ChatMessageRecord = {
      id: createClientMessageId(),
      role: "user",
      content: question
    };

    logChatEvent("submit-start", {
      submissionId,
      questionLength: question.length,
      fromSuggestion: Boolean(rawQuestion),
      messageCountBeforeAppend: currentState.messages.length
    });

    flushSync(() => {
      updateChatShellStore((state) => ({
        ...state,
        messages: [...state.messages, userMessage],
        isLoading: true,
        input: "",
        submitError: null,
        activeSubmissionId: submissionId
      }));
    });

    logChatEvent("user-message-queued", {
      submissionId,
      userMessageId: userMessage.id,
      messageCountAfterAppend: readChatShellStore().messages.length
    });

    if (
      textareaRef.current &&
      document.activeElement === textareaRef.current &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 640px)").matches
    ) {
      textareaRef.current.blur();
      logChatEvent("keyboard-collapsed", { submissionId });
    }

    try {
      logChatEvent("api-request-start", {
        submissionId,
        endpoint: "/api/chat"
      });
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question
        } satisfies ChatRequestPayload)
      });
      logChatEvent("api-response-received", {
        submissionId,
        ok: response.ok,
        status: response.status
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with ${response.status}`);
      }

      const payload = (await response.json()) as ChatResponsePayload;
      logChatEvent("api-response-parsed", {
        submissionId,
        answerStatus: payload.answerStatus,
        citations: payload.citations.length,
        escalationSuggested: payload.escalationSuggested
      });

      updateChatShellStore((state) => ({
        ...state,
        messages: [
          ...state.messages,
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
        ],
        isLoading: false,
        submitError: null,
        activeSubmissionId: null
      }));
      logChatEvent("assistant-message-queued", {
        submissionId,
        assistantMessageId: payload.id,
        answerStatus: payload.answerStatus
      });
    } catch (error) {
      console.error("[chat-shell] submit-failed", {
        submissionId,
        error
      });
      updateChatShellStore((state) => ({
        ...state,
        messages: [
          ...state.messages,
          {
            ...fallbackNetworkMessage,
            id: createClientMessageId("err")
          }
        ],
        isLoading: false,
        submitError: "Unable to send right now. Please try again.",
        activeSubmissionId: null
      }));
    } finally {
      logChatEvent("submit-finished", {
        submissionId
      });
    }
  };

  return (
    <Card className="workspace-panel flex h-[82svh] min-h-0 max-h-[calc(100svh-1.25rem)] flex-col overflow-hidden border-white/10 p-0 supports-[height:100dvh]:h-[82dvh] supports-[height:100dvh]:max-h-[calc(100dvh-1.25rem)] sm:min-h-[640px] sm:max-h-[880px] lg:h-[840px]">
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
        <div className="h-full min-h-0 overflow-y-auto overscroll-contain pr-1" ref={scrollRef}>
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

      <div
        className="relative z-10 shrink-0 border-t border-white/10 bg-surface/96 px-3 py-3 sm:px-5 sm:py-4"
        ref={composerRef}
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            logChatEvent("form-submit", {
              canSubmit
            });
            void submitQuestion();
          }}
        >
          <div className="rounded-[26px] border border-white/10 bg-background/35 p-3">
            <Textarea
              className="min-h-[104px] resize-none border-transparent bg-transparent px-1 py-1 text-[15px] leading-6 focus:border-transparent focus:ring-0 sm:min-h-[92px]"
              disabled={isLoading}
              enterKeyHint="send"
              maxLength={600}
              onChange={(event) => {
                updateChatShellStore((state) => ({
                  ...state,
                  input: event.target.value,
                  submitError: null
                }));
              }}
              onFocus={revealComposer}
              onKeyDown={handleInputKeyDown}
              placeholder="Ask about plans, invoices, billing policy, cancellation guidance, or support routing"
              ref={textareaRef}
              rows={3}
              value={input}
            />

            {submitError ? (
              <div
                aria-live="polite"
                className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-300/15 bg-amber-300/8 px-3 py-2.5 text-sm text-[#f1dfc2]"
              >
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{submitError}</p>
              </div>
            ) : null}

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-muted">
                Public docs only. Billing changes, cancellations, refunds, and private-data requests always route to support.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <span className="text-xs text-muted">{input.length}/600</span>
                <Button
                  className="pointer-events-auto relative z-10 min-h-[48px] w-full min-w-0 sm:min-h-0 sm:w-auto sm:min-w-[150px]"
                  disabled={!canSubmit}
                  onClick={() => {
                    logChatEvent("send-button-pressed", {
                      canSubmit,
                      isLoading,
                      activeSubmissionId
                    });
                  }}
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
