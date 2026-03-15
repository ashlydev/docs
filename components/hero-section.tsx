import { ArrowRight, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

type HeroSectionProps = {
  sourceSetLabel: string;
};

export function HeroSection({ sourceSetLabel }: HeroSectionProps) {
  return (
    <section className="section-shell relative pt-10 md:pt-16">
      <div className="panel relative overflow-hidden p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.16),transparent_34%)]" />
        <div className="relative max-w-4xl">
          <Badge variant="accent" className="mb-5">
            {siteConfig.heroEyebrow}
          </Badge>
          <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-text md:text-6xl">
            {siteConfig.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted md:text-xl">
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
              {siteConfig.secondaryCtaLabel}
            </a>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-muted md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              Public-doc scope
              <p className="mt-1 text-xs text-muted/80">
                Designed to answer from published support content only, whether it lives in curated repo docs or your public help center.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              Safe by default
              <p className="mt-1 text-xs text-muted/80">
                Account actions, refunds, and billing changes escalate instead of hallucinating.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              Pilot-ready scope
              <p className="mt-1 text-xs text-muted/80">
                Configured here with {sourceSetLabel.toLowerCase()} so the same flow can be retargeted quickly to your own docs later.
              </p>
            </div>
          </div>
          <div className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted/90">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Grounded answers only when supported by citations
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 top-10 hidden h-60 w-60 rounded-full bg-sky-400/10 blur-3xl md:block" />
        <div className="pointer-events-none absolute bottom-0 left-10 hidden h-40 w-40 rounded-full bg-blue-500/10 blur-3xl md:block" />
      </div>
    </section>
  );
}
