import { BarChart3, BookOpenText, Files, ShieldAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";

const featureIcons = [Files, BookOpenText, ShieldAlert, BarChart3];

export function FeatureCards() {
  return (
    <section className="section-shell mt-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">What the product experience proves</p>
          <h2 className="mt-4 font-display text-3xl font-semibold text-text md:text-4xl">
            A support layer that feels operational, not improvised
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-muted">
          The showcase stays focused on one job: answering repetitive public-doc questions clearly, then handing the risky work to support without drama.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {siteConfig.featureCards.map((feature, index) => {
          const Icon = featureIcons[index];

          return (
            <Card
              key={feature.title}
              className="workspace-panel h-full border-white/10 bg-white/[0.025]"
            >
              <CardHeader className="pb-4">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
