import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function FooterCTA() {
  return (
    <section className="section-shell mt-16 pb-20 md:mt-24">
      <div className="panel relative overflow-hidden p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.14),transparent_28%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{siteConfig.footerEyebrow}</p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-text md:text-4xl">
              {siteConfig.footerHeadline}
            </h2>
          </div>
          <a
            className={buttonVariants({
              size: "lg"
            })}
            href={siteConfig.teardownHref}
            rel="noreferrer"
            target="_blank"
          >
            {siteConfig.footerCtaLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
