import { ArrowRight, BookText, ShieldCheck, Waypoints } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

type HeroSectionProps = {
  sourceSetLabel: string;
};

const heroSignals = [
  {
    title: "Grounded by design",
    body: "Answers stay tied to indexed public support material instead of generic assistant copy."
  },
  {
    title: "Boundaries stay visible",
    body: "Account-specific work routes to human support instead of implying private system access."
  },
  {
    title: "Ready for buyer review",
    body: "The workspace shows citations, fallback behavior, and escalation paths in one product-grade flow."
  }
];

export function HeroSection({ sourceSetLabel }: HeroSectionProps) {
  return (
    <section className="section-shell pt-4 md:pt-6">
      <div className="workspace-panel px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-accent">
              <BookText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">{siteConfig.name}</p>
              <p className="text-sm text-muted">Source-backed support guidance for scheduling SaaS</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              className={buttonVariants({
                variant: "ghost",
                size: "sm"
              })}
              href={siteConfig.howItWorksHref}
            >
              How it works
            </a>
            <a
              className={buttonVariants({
                variant: "secondary",
                size: "sm"
              })}
              href={siteConfig.teardownHref}
              rel="noreferrer"
              target="_blank"
            >
              {siteConfig.secondaryCtaLabel}
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_360px]">
        <div className="workspace-panel overflow-hidden p-7 sm:p-10">
          <div className="max-w-3xl">
            <Badge className="mb-5" variant="accent">
              {siteConfig.heroEyebrow}
            </Badge>
            <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl lg:text-6xl">
              A calmer, more trustworthy support flow for public documentation.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              {siteConfig.subtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className={buttonVariants({
                  size: "lg"
                })}
                href={siteConfig.tryDemoHref}
              >
                {siteConfig.primaryCtaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a
                className={buttonVariants({
                  variant: "secondary",
                  size: "lg"
                })}
                href={siteConfig.teardownHref}
                rel="noreferrer"
                target="_blank"
              >
                Talk through your support flow
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {heroSignals.map((signal) => (
                <div
                  className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4"
                  key={signal.title}
                >
                  <p className="text-sm font-semibold text-text">{signal.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{signal.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="workspace-panel p-6 sm:p-7">
          <p className="eyebrow">Why this feels credible</p>
          <h2 className="mt-4 font-display text-2xl font-semibold text-text">
            The product experience stays close to real support operations.
          </h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-accent">
                  <Waypoints className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">Indexed source set</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Currently configured with {sourceSetLabel.toLowerCase()} so the workflow stays stable in hosted demos.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-success">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">Support boundaries remain explicit</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Billing changes, cancellations, refunds, and private-data requests continue through the documented support path.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-[24px] border border-dashed border-white/10 bg-background/30 px-4 py-4">
            <p className="text-sm font-semibold text-text">Grounded answers only when supported by citations</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              The assistant is allowed to be concise, but it is not allowed to overstate what it knows.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
