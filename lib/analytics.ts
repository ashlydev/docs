import { demoAnalyticsBaseline } from "@/lib/site-config";
import { hasSupabaseConfig } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { AnalyticsSummary, ChatResponsePayload } from "@/types/support-bot";

type LogChatInteractionInput = {
  question: string;
  response: ChatResponsePayload;
  heuristicFlags: string[];
};

export async function logChatInteraction({
  question,
  response,
  heuristicFlags
}: LogChatInteractionInput) {
  if (!hasSupabaseConfig()) {
    return;
  }

  const supabase = getSupabaseAdmin();
  const topSources = response.citations.map((citation) => ({
    title: citation.sourceTitle,
    url: citation.sourceUrl
  }));

  try {
    await Promise.all([
      supabase.from("chat_logs").insert({
        question,
        answer: response.answer,
        answer_status: response.answerStatus,
        fallback_triggered: response.fallbackTriggered,
        escalation_suggested: response.escalationSuggested,
        confidence_score: response.confidenceScore,
        category: response.category,
        heuristic_flags: heuristicFlags,
        top_sources: topSources
      }),
      supabase.from("analytics_events").insert({
        event_type: "chat_completed",
        question,
        payload: {
          answer_status: response.answerStatus,
          fallback_triggered: response.fallbackTriggered,
          escalation_suggested: response.escalationSuggested,
          category: response.category,
          top_sources: topSources
        }
      })
    ]);
  } catch (error) {
    console.error("Failed to log chat interaction", error);
  }
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  if (!hasSupabaseConfig()) {
    return demoAnalyticsBaseline;
  }

  const supabase = getSupabaseAdmin();

  try {
    const [
      totalResult,
      fallbackResult,
      escalationResult,
      categoriesResult
    ] = await Promise.all([
      supabase
        .from("chat_logs")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("chat_logs")
        .select("*", { count: "exact", head: true })
        .eq("fallback_triggered", true),
      supabase
        .from("chat_logs")
        .select("*", { count: "exact", head: true })
        .eq("escalation_suggested", true),
      supabase
        .from("chat_logs")
        .select("category")
        .order("created_at", { ascending: false })
        .limit(200)
    ]);

    const total = totalResult.count ?? 0;
    const fallbackCount = fallbackResult.count ?? 0;
    const escalationCount = escalationResult.count ?? 0;
    const categoryRows = (categoriesResult.data ?? []) as Array<{
      category: string | null;
    }>;

    if (total === 0) {
      return demoAnalyticsBaseline;
    }

    const categoryMap = new Map<string, number>();

    for (const row of categoryRows) {
      const category = row.category ?? "other";
      categoryMap.set(category, (categoryMap.get(category) ?? 0) + 1);
    }

    const topCategories = Array.from(categoryMap.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
      .map(([label, count]) => ({
        label: label.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
        count
      }));

    return {
      questionsAnswered: total,
      fallbackRate: total > 0 ? fallbackCount / total : 0,
      escalationsTriggered: escalationCount,
      topCategories: topCategories.length > 0 ? topCategories : demoAnalyticsBaseline.topCategories,
      mode: "live"
    };
  } catch (error) {
    console.error("Failed to load analytics summary", error);
    return demoAnalyticsBaseline;
  }
}
