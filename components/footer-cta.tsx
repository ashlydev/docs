import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function FooterCTA() {
  return (
    <section className="section-shell mt-16 pb-20 md:mt-20">
      <div className="workspace-panel p-8 sm:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">{siteConfig.footerEyebrow}</p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-text md:text-4xl">
              {siteConfig.footerHeadline}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Review your public support flow, map the safe coverage boundaries, and decide where a fixed-scope pilot would create the most leverage.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              className={buttonVariants({
                variant: "secondary",
                size: "lg"
              })}
              href={siteConfig.supportLink}
              rel="noreferrer"
              target="_blank"
            >
              Talk through support routing
            </a>
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
      </div>
    </section>
  );
}
