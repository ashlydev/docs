import { DatabaseZap, ScanSearch, ShieldEllipsis, Waypoints } from "lucide-react";

import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";

const stepIcons = [DatabaseZap, ScanSearch, Waypoints, ShieldEllipsis];

export function HowItWorks() {
  return (
    <section className="section-shell mt-16" id="how-it-works">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-xl">
          <p className="eyebrow">How the support flow works</p>
          <h2 className="mt-4 font-display text-3xl font-semibold text-text md:text-4xl">
            The assistant stays useful because the boundaries are built into the workflow.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Retrieval, citations, fallback, and escalation are treated as part of the product experience instead of hidden implementation details.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {siteConfig.howItWorksSteps.map((step, index) => {
            const Icon = stepIcons[index];

            return (
              <Card className="workspace-panel p-6" key={step.title}>
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-text">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">{step.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
