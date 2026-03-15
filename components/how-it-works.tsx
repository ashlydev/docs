import { DatabaseZap, ScanSearch, ShieldEllipsis, Waypoints } from "lucide-react";

import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";

const stepIcons = [DatabaseZap, ScanSearch, Waypoints, ShieldEllipsis];

export function HowItWorks() {
  return (
    <section className="section-shell mt-16" id="how-it-works">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">How it works</p>
        <h2 className="mt-4 font-display text-3xl font-semibold text-text md:text-4xl">
          How the support flow stays grounded
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {siteConfig.howItWorksSteps.map((step, index) => {
          const Icon = stepIcons[index];

          return (
            <Card className="panel p-6" key={step.title}>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sky-200">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-xs uppercase tracking-[0.18em] text-muted">
                Step {index + 1}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold text-text">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">{step.description}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
