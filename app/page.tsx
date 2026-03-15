import { ArrowRight, CheckCircle2, LibraryBig, ShieldCheck } from "lucide-react";

import { AnalyticsPanel } from "@/components/analytics-panel";
import { ChatShell } from "@/components/chat-shell";
import { FeatureCards } from "@/components/feature-cards";
import { FooterCTA } from "@/components/footer-cta";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAnalyticsSummary } from "@/lib/analytics";
import { getDefaultSourceSet } from "@/lib/demo-sources";
import { siteConfig } from "@/lib/site-config";

export default async function HomePage() {
  const analytics = await getAnalyticsSummary();
  const sourceSet = getDefaultSourceSet();

  return (
    <main className="relative overflow-hidden pb-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-fade bg-[size:120px_120px] opacity-[0.035]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,rgba(204,176,137,0.12),transparent_55%)]" />

      <HeroSection sourceSetLabel={sourceSet.label} />

      <section className="section-shell mt-8 md:mt-10" id="demo">
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-4 xl:sticky xl:top-6">
            <Card className="workspace-panel p-6 sm:p-7">
              <Badge variant="accent">Support workspace</Badge>
              <h2 className="mt-4 font-display text-2xl font-semibold text-text">
                Built to answer the repeatable public questions first
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                The conversation experience stays tight on one job: answer from the indexed knowledge base, show the source, and route the risky work to support.
              </p>
              <div className="mt-6 space-y-3">
                {siteConfig.useCases.map((useCase) => (
                  <div
                    className="flex gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3"
                    key={useCase}
                  >
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" />
                    <p className="text-sm leading-6 text-muted">{useCase}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="workspace-panel p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Current indexed knowledge base</p>
                  <h3 className="mt-3 font-display text-xl font-semibold text-text">
                    Stable demo content already mapped into the workspace
                  </h3>
                </div>
                {sourceSet.reviewHref ? (
                  <a
                    className={buttonVariants({
                      variant: "secondary",
                      size: "sm"
                    })}
                    href={sourceSet.reviewHref}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {sourceSet.reviewLabel ?? "Review source set"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                ) : (
                  <Badge>{sourceSet.reviewLabel ?? "Bundled docs"}</Badge>
                )}
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">
                {sourceSet.description} This keeps the hosted experience stable while still demonstrating citations, fallback behavior, and escalation boundaries.
              </p>
              <div className="mt-5 space-y-2.5">
                {sourceSet.sources.slice(0, 6).map((item) => (
                  <div
                    className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3"
                    key={item.url}
                  >
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-accent">
                      <LibraryBig className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text">{item.label}</p>
                      <p className="mt-1 truncate text-xs text-muted">{item.url}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="workspace-panel p-6 sm:p-7">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-success">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">Support boundaries stay explicit</p>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    Billing changes, cancellations, refunds, and private account requests continue through the documented support path instead of being improvised by the assistant.
                  </p>
                </div>
              </div>
              <a
                className={buttonVariants({
                  variant: "secondary",
                  size: "lg"
                }) + " mt-6 w-full"}
                href={siteConfig.teardownHref}
                rel="noreferrer"
                target="_blank"
              >
                Talk through your support flow
              </a>
            </Card>
          </div>

          <div className="min-w-0">
            <ChatShell />
          </div>
        </div>
      </section>

      <FeatureCards />
      <HowItWorks />

      <section className="section-shell mt-16">
        <AnalyticsPanel summary={analytics} />
      </section>

      <FooterCTA />
    </main>
  );
}
