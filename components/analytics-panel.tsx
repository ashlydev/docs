import { ChartColumn, ShieldCheck, TriangleAlert } from "lucide-react";

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
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_360px]">
      <Card className="workspace-panel p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <Badge variant={summary.mode === "live" ? "success" : "accent"}>
              {summary.mode === "live" ? "Live telemetry" : "Pilot baseline"}
            </Badge>
            <h2 className="mt-4 font-display text-3xl font-semibold text-text">
              Product telemetry that supports the buyer conversation
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Show how much of the repetitive support load is already covered, where documentation is thin, and how often the flow routes users to a human.
            </p>
          </div>
          <p className="max-w-sm text-sm leading-7 text-muted">
            These metrics help position the pilot as an operational layer, not just a chat surface.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {metrics.map((metric, index) => {
            const Icon = analyticsIcons[index];

            return (
              <div
                className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
                key={metric.label}
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-accent">
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

      <Card className="workspace-panel p-6 sm:p-7">
        <p className="eyebrow">Current support themes</p>
        <div className="mt-5 space-y-3">
          {summary.topCategories.map((category) => (
            <div
              className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3"
              key={category.label}
            >
              <span className="text-sm font-medium text-text">{category.label}</span>
              <span className="text-sm text-muted">{category.count}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-[22px] border border-white/10 bg-background/30 p-4 text-sm leading-7 text-muted">
          Use this view to show where the docs are already strong, where fallback still protects the experience, and where a pilot can reduce repeat support work first.
        </div>
      </Card>
    </section>
  );
}
