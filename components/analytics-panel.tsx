import { ArrowUpRight, ChartColumn, ShieldCheck, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";
import type { AnalyticsSummary } from "@/types/support-bot";

type AnalyticsPanelProps = {
  summary: AnalyticsSummary;
};

const analyticsIcons = [ChartColumn, TriangleAlert, ShieldCheck];

export function AnalyticsPanel({ summary }: AnalyticsPanelProps) {
  const metrics = [
    {
      label: "Questions answered",
      value: summary.questionsAnswered.toLocaleString()
    },
    {
      label: "Fallback rate",
      value: formatPercent(summary.fallbackRate)
    },
    {
      label: "Escalations triggered",
      value: summary.escalationsTriggered.toLocaleString()
    }
  ];

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="panel p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant={summary.mode === "live" ? "success" : "accent"}>
              {summary.mode === "live" ? "live activity" : "pilot baseline"}
            </Badge>
            <h2 className="mt-4 font-display text-3xl font-semibold text-text">
              What the support flow reveals
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
              Track answer coverage, fallback rate, escalation volume, and the topics that create the most repetitive support demand.
            </p>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-sky-200 md:inline-flex">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {metrics.map((metric, index) => {
            const Icon = analyticsIcons[index];

            return (
              <div
                className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5"
                key={metric.label}
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sky-100">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-5 text-sm text-muted">{metric.label}</p>
                <p className="mt-2 font-display text-3xl font-semibold text-text">
                  {metric.value}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="panel p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Top categories</p>
        <div className="mt-6 space-y-3">
          {summary.topCategories.map((category) => (
            <div
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3"
              key={category.label}
            >
              <span className="text-sm font-medium text-text">{category.label}</span>
              <span className="text-sm text-muted">{category.count}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-7 text-muted">
          Use this view to show where documentation is already strong, where human handoff still matters, and where a fixed-scope pilot can remove repetitive support work first.
        </div>
      </Card>
    </section>
  );
}
