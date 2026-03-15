import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";

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
    <main className="relative overflow-hidden pb-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-fade bg-[size:96px_96px] opacity-[0.08]" />
      <HeroSection sourceSetLabel={sourceSet.label} />
      <FeatureCards />

      <section className="section-shell mt-16" id="demo">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <Card className="panel p-6 md:p-8">
              <Badge variant="accent">Support flow preview</Badge>
              <h2 className="mt-4 font-display text-3xl font-semibold text-text md:text-4xl">
                Designed to reduce repetitive support questions
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                This support flow answers pricing, billing, invoice, and support-route questions from curated support docs. Supported answers stay grounded in retrieved sources, and anything risky or account-specific moves to human support.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sky-100">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-text">What this support flow handles well</p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-muted">
                    {siteConfig.useCases.map((useCase) => (
                      <li className="flex gap-3" key={useCase}>
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sky-100">
                    <LockKeyhole className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-text">What stays with human support</p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-muted">
                    <li>Billing changes, cancellations, refunds, and account mutations always escalate.</li>
                    <li>No private customer data or account access is implied.</li>
                    <li>Low-confidence answers fall back instead of guessing.</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="panel p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Public knowledge base</p>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-text">
                    Stable support content already mapped into the demo
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
                  <Badge>{sourceSet.reviewLabel ?? "Repo-local docs"}</Badge>
                )}
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">
                {sourceSet.description} The hosted demo defaults to repo-local docs so ingestion stays stable even when third-party sites throttle or block server-side fetches.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {sourceSet.sources.slice(0, 6).map((item) => (
                  <div
                    className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3"
                    key={item.url}
                  >
                    <p className="text-sm font-medium text-text">{item.label}</p>
                    <p className="mt-1 truncate text-xs text-muted">{item.url}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:sticky lg:top-6">
            <ChatShell />
          </div>
        </div>
      </section>

      <HowItWorks />

      <section className="section-shell mt-16">
        <AnalyticsPanel summary={analytics} />
      </section>

      <FooterCTA />
    </main>
  );
}
