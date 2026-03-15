import type { AnalyticsSummary } from "@/types/support-bot";

const publicSupportLink =
  process.env.NEXT_PUBLIC_SUPPORT_LINK ?? "https://www.example.com/support";
const publicTeardownLink =
  process.env.NEXT_PUBLIC_TEARDOWN_LINK ?? "https://www.example.com/teardown";

export const siteConfig = {
  name: "Docs-Based Support Bot for Scheduling SaaS",
  subtitle:
    "Grounded answers from public help docs with source citations and human escalation for pricing, billing, and support questions.",
  heroEyebrow: "Fixed-scope pilot for scheduling SaaS",
  botName: "Support Knowledge Assistant",
  botStatus: "Public-doc answers with citations, fallback, and human escalation",
  tryDemoHref: "#demo",
  howItWorksHref: "#how-it-works",
  primaryCtaLabel: "Review support flow",
  secondaryCtaLabel: "Book a teardown",
  teardownHref: publicTeardownLink,
  supportLink: publicSupportLink,
  chatTrustLine:
    "Ask about plans, billing policies, invoices, support routing, or other public workflows.",
  emptyStateExamples: [
    "Which plan is best for a small team?",
    "How do invoices or billing policies work?",
    "Where should customers contact support?"
  ],
  featureCards: [
    {
      title: "Grounded answers from docs",
      description:
        "Answer repetitive pricing, billing, and support questions from your public documentation instead of forcing visitors into support queues."
    },
    {
      title: "Source-backed citations",
      description:
        "Show the exact public pages behind each supported answer so teams can verify the experience at a glance."
    },
    {
      title: "Safe fallback and refusal",
      description:
        "Low-confidence retrieval and account-specific requests trigger a clean fallback instead of unsupported claims."
    },
    {
      title: "Human escalation and analytics",
      description:
        "Risky requests route to human support while interaction logging highlights recurring support demand."
    }
  ],
  useCases: [
    "Pricing, billing, invoice, and support-route questions can be handled from public help content.",
    "Supported answers stay tied to retrieved documentation instead of generic chatbot copy.",
    "Account-specific work and weak evidence route cleanly to human support."
  ],
  howItWorksSteps: [
    {
      title: "Ingest public docs",
      description:
        "Pull pricing, help center, billing, and support pages into a searchable public knowledge base."
    },
    {
      title: "Retrieve relevant sources",
      description:
        "Embed each question and retrieve the strongest matching chunks from pgvector before the model answers."
    },
    {
      title: "Answer with citations",
      description:
        "Generate a concise answer only from retrieved context and attach the supporting sources underneath."
    },
    {
      title: "Escalate when uncertain",
      description:
        "If confidence is weak or the request becomes account-specific, the experience falls back and routes to support."
    }
  ],
  footerEyebrow: "Fixed-scope pilot",
  footerHeadline:
    "Launch a docs-based support bot pilot grounded in your public help center and pricing docs.",
  footerCtaLabel: "Request a pilot"
};

export const demoAnalyticsBaseline: AnalyticsSummary = {
  questionsAnswered: 148,
  fallbackRate: 0.18,
  escalationsTriggered: 26,
  topCategories: [
    { label: "Billing", count: 46 },
    { label: "Pricing", count: 39 },
    { label: "Support", count: 34 },
    { label: "Plans", count: 29 }
  ],
  mode: "demo"
};
