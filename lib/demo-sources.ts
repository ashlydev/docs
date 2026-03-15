import { bundledDemoSources } from "@/lib/demo-kb";
import type { SourceSet } from "@/types/support-bot";

export const sourceSets: SourceSet[] = [
  {
    key: "demo-local",
    label: "Bundled scheduling SaaS docs",
    description:
      "A bundled internal knowledge base covering pricing, plans, billing, invoices, cancellations, support, and escalation policy for a fictional scheduling SaaS.",
    reviewLabel: "Bundled demo docs",
    sources: bundledDemoSources
  },
  {
    key: "calendly-public-docs",
    label: "Optional external public docs",
    description:
      "Live external URLs for teams who want to test the pipeline against a real public help center. This is optional and less reliable than the repo-local demo docs.",
    reviewHref: "https://help.calendly.com/hc/en-us",
    reviewLabel: "External help center",
    sources: [
      {
        label: "Pricing",
        url: "https://calendly.com/pricing"
      },
      {
        label: "Help Center",
        url: "https://help.calendly.com/hc/en-us"
      },
      {
        label: "Billing overview",
        url: "https://help.calendly.com/hc/en-us/articles/15444548082711-Billing-overview"
      },
      {
        label: "Plan and billing changes",
        url: "https://help.calendly.com/hc/en-us/articles/223195388-Changing-your-organization-s-plan-seats-and-billing-information"
      },
      {
        label: "Invoice download",
        url: "https://help.calendly.com/hc/en-us/articles/4407011246487-How-to-download-your-Calendly-invoice"
      },
      {
        label: "Contact support",
        url: "https://help.calendly.com/hc/en-us/requests/new"
      }
    ]
  }
];

export function getDefaultSourceSet() {
  return sourceSets[0];
}

export function getSourceSetByKey(key?: string) {
  if (!key) {
    return getDefaultSourceSet();
  }

  return sourceSets.find((set) => set.key === key) ?? getDefaultSourceSet();
}
