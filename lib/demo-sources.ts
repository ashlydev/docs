import type { SourceSet } from "@/types/support-bot";

export const sourceSets: SourceSet[] = [
  {
    key: "calendly-public-docs",
    label: "Calendly-style public docs",
    description:
      "Public pages covering pricing, billing, help center, and support contact flows.",
    supportLink: "https://calendly.com/contact-us",
    urls: [
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
      },
      {
        label: "Contact us",
        url: "https://calendly.com/contact-us"
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
