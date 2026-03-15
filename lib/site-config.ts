import type { AnalyticsSummary } from "@/types/support-bot";

const publicSupportLink =
  process.env.NEXT_PUBLIC_SUPPORT_LINK ?? "https://www.example.com/support";
const publicTeardownLink =
  process.env.NEXT_PUBLIC_TEARDOWN_LINK ?? "https://www.example.com/teardown";

export const siteConfig = {
  name: "Docs-Based Support Bot for Scheduling SaaS",
  subtitle:
    "Source-backed support guidance for scheduling SaaS teams, grounded in public documentation and designed to hand off account-specific work cleanly.",
  heroEyebrow: "Grounded support workflow for scheduling SaaS",
  botName: "Support Knowledge Assistant",
  botStatus: "Answers from public docs with citations and a clear human support path",
  tryDemoHref: "#demo",
  howItWorksHref: "#how-it-works",
  primaryCtaLabel: "Explore the support workspace",
  secondaryCtaLabel: "Book a teardown",
  teardownHref: publicTeardownLink,
  supportLink: publicSupportLink,
  chatTrustLine:
    "Ask about plans, billing policies, invoices, cancellation guidance, or how customers should reach support.",
  suggestedPrompts: [
    {
      label: "Plans",
      prompt: "What plans are available?",
      description: "Review Starter, Growth, Team, and Enterprise."
    },
    {
      label: "Fit",
      prompt: "Which plan fits a small team?",
      description: "See the recommended public plan guidance."
    },
    {
      label: "Billing",
      prompt: "How do invoices work?",
      description: "Understand invoice access and billing workflow."
    },
    {
      label: "Support",
      prompt: "How do I contact support?",
      description: "Route account-specific work to the right path."
    },
    {
      label: "Cancellation",
      prompt: "What happens if I cancel?",
      description: "Check cancellation timing and support boundaries."
    }
  ],
  featureCards: [
    {
      title: "Grounded answers from public docs",
      description:
        "Handle repetitive pricing, billing, and support questions from a controlled knowledge base instead of pushing every visitor into support."
    },
    {
      title: "Source-backed citations",
      description:
        "Keep every supported answer tied to the underlying source material so teams can verify the guidance quickly."
    },
    {
      title: "Clear support boundaries",
      description:
        "Low-confidence questions and account-specific requests stay contained with a concise fallback or a direct support handoff."
    },
    {
      title: "Operational visibility",
      description:
        "Interaction logging highlights the documentation gaps and support themes worth fixing first."
    }
  ],
  useCases: [
    "Pricing, billing, invoice, and support-route questions stay grounded in published support material.",
    "Supported answers remain tied to retrieved documentation instead of generic chatbot language.",
    "Account-specific work and weak evidence route cleanly to human support."
  ],
  howItWorksSteps: [
    {
      title: "Index the support knowledge base",
      description:
        "Load bundled demo docs or your own public support pages into the searchable support knowledge base."
    },
    {
      title: "Retrieve the strongest matches",
      description:
        "Embed each question and pull the best matching chunks from pgvector before the model responds."
    },
    {
      title: "Answer with citations",
      description:
        "Respond only from retrieved context and keep the supporting sources attached underneath the answer."
    },
    {
      title: "Escalate the risky cases",
      description:
        "If the evidence is weak or the request becomes account-specific, the experience hands the user to support cleanly."
    }
  ],
  footerEyebrow: "Next step",
  footerHeadline:
    "See how a grounded support layer would fit your public help flow.",
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
