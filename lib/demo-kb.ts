import type { IngestSource } from "@/types/support-bot";

export type BundledDemoDocument = {
  slug: string;
  title: string;
  sourceUrl: string;
  sourceDomain: "demo-kb";
  content: string;
};

export const bundledDemoKnowledgeBase: BundledDemoDocument[] = [
  {
    slug: "pricing",
    title: "Pricing & Plans",
    sourceUrl: "internal://demo-kb/pricing",
    sourceDomain: "demo-kb",
    content: `# Pricing & Plans

Northstar Scheduling offers four plans so teams can start with a lightweight setup and move into shared routing, admin controls, and procurement support as they grow.

## Starter

- Best for solo operators and independent consultants
- One scheduler seat
- Unlimited booking pages
- Email reminders
- Basic availability rules
- Standard support

Starter is priced at $12 per seat each month when billed monthly, or $10 per seat each month when billed annually.

## Growth

- Best for small teams coordinating leads or client calls
- Two to ten scheduler seats
- Shared event templates
- Round-robin routing
- Team availability overlays
- Basic reporting

Growth is priced at $24 per seat each month when billed monthly, or $20 per seat each month when billed annually.

## Team

- Best for revenue, success, and operations teams with shared scheduling workflows
- Ten or more scheduler seats
- Admin roles and approval controls
- Managed routing pools
- Salesforce and HubSpot sync
- Priority support

Team is priced at $44 per seat each month when billed monthly, or $38 per seat each month when billed annually.

## Enterprise

- Best for security review, advanced governance, or procurement-managed rollouts
- SSO and SCIM
- Security questionnaire support
- Customer success onboarding
- Custom terms on annual agreements

Enterprise is sold on annual contracts with custom pricing.

## Annual billing

Annual billing applies the lower per-seat rate shown above and keeps seat pricing fixed for the contract term. Teams on annual plans can still add seats during the term, and the added seats are prorated for the remaining contract period.

## Trial and upgrades

New workspaces can start a 14-day trial on Growth. Upgrades take effect immediately. Downgrades and cancellations follow the billing policy in the Billing & Subscription Changes article.`
  },
  {
    slug: "plans",
    title: "Plans for Teams",
    sourceUrl: "internal://demo-kb/plans",
    sourceDomain: "demo-kb",
    content: `# Plans for Teams

This guide helps prospects understand which Northstar Scheduling plan fits their team size and workflow.

## Which plan fits a solo business?

Starter is the best fit for a solo consultant, coach, recruiter, or service provider who only needs one scheduler seat and straightforward booking pages.

## Which plan fits a small team?

Growth is the recommended plan for most small teams. It is designed for teams of two to ten scheduler seats that need shared templates, round-robin assignment, and team-wide availability rules without full enterprise administration.

## Which plan fits a larger operating team?

Team is intended for larger customer-facing groups that need admin controls, routing pools, CRM sync, and priority support. It is the right fit when scheduling is shared across revenue, onboarding, or support functions and several managers need visibility.

## When to consider Enterprise

Enterprise is appropriate when the rollout requires procurement review, security review, SSO, SCIM, or contract terms that are not available on self-serve plans.

## Upgrade guidance

- Start with Starter if one person owns scheduling.
- Move to Growth once scheduling becomes shared across a small team.
- Move to Team once routing, admin controls, or CRM-managed workflows become operational requirements.
- Move to Enterprise for procurement-led or security-led rollouts.

## What the bot can answer

The support assistant can explain public plan differences, pricing structure, support routes, invoice download steps, and cancellation policy. It cannot recommend a private contract term, inspect a live workspace, or make account changes on a customer's behalf.`
  },
  {
    slug: "billing",
    title: "Billing & Subscription Changes",
    sourceUrl: "internal://demo-kb/billing",
    sourceDomain: "demo-kb",
    content: `# Billing & Subscription Changes

Northstar Scheduling keeps billing self-serve for most standard plan changes, while account-specific actions still require an authenticated workspace admin.

## Billing cycle options

Starter, Growth, and Team can be billed monthly or annually. Annual billing lowers the per-seat rate and locks pricing for the active term.

## Updating payment details

Workspace owners and billing admins can update the payment method, billing contact, and company billing address from Settings, then Billing. These changes are not available through the public support assistant because they require access to the private account.

## Changing plan level

Upgrades take effect immediately and prorate the remaining time in the current billing cycle. Downgrades are scheduled for the next renewal date so the current features remain available through the paid term.

## Adding or removing seats

Additional seats can be added at any time. Mid-cycle seat increases are prorated. Seat removals take effect on the next renewal so historical assignments and existing workflows are not disrupted during the active term.

## Taxes and receipts

Tax handling depends on the billing country and any tax information saved on the workspace. Receipts and invoices are available in the Billing area for eligible paid plans.

## Refund policy

Northstar Scheduling does not issue prorated refunds for partial months on self-serve monthly plans. Annual contract exceptions, if any, are handled by the account team and documented in the signed order form.

## Important support boundary

The support assistant can explain the public billing policy, but it cannot update payment methods, change billing contacts, cancel a subscription, or inspect a private invoice record for a customer.`
  },
  {
    slug: "invoices",
    title: "Billing & Invoices",
    sourceUrl: "internal://demo-kb/invoices",
    sourceDomain: "demo-kb",
    content: `# Billing & Invoices

Paid Northstar Scheduling workspaces can download invoices and receipts from the Billing area.

## How to download an invoice

1. Sign in as a workspace owner or billing admin.
2. Open Settings.
3. Select Billing.
4. Open Invoice History.
5. Choose the invoice you need and download the PDF copy.

## What appears on the invoice

Invoices include the billing period, plan level, seat count charged for that billing event, tax information when applicable, and the billing entity saved on the workspace.

## Who can access invoices

Only authenticated workspace owners and billing admins can download invoices. The public support assistant cannot fetch or email invoices because it does not have account access.

## When invoices are created

- Monthly plans generate an invoice at each monthly renewal.
- Annual plans generate an invoice at the annual renewal and prorated invoices when extra seats are added mid-term.

## Missing invoice questions

If an expected invoice is missing, the fastest path is for the workspace owner or billing admin to contact support with the workspace name, billing email, and renewal date so the billing team can investigate.`
  },
  {
    slug: "cancellations",
    title: "Cancellation Policy",
    sourceUrl: "internal://demo-kb/cancellations",
    sourceDomain: "demo-kb",
    content: `# Cancellation Policy

Northstar Scheduling separates public policy guidance from account actions that require an authenticated admin.

## Monthly plans

Monthly Starter, Growth, and Team plans can be canceled by a workspace owner from Settings, then Billing. The cancellation takes effect at the end of the current paid month. The workspace keeps access through the end of that billing period.

## Annual plans

Annual plans do not auto-refund unused time after cancellation. Access remains available through the contracted term unless a signed agreement says otherwise.

## Downgrades instead of cancellation

Teams that still need basic scheduling but no longer need shared routing or advanced admin controls can schedule a downgrade for the next renewal date instead of fully canceling.

## Data access after cancellation

Admins should export anything they need before the end of the paid term. After the workspace leaves a paid state, feature access may change and retention windows may apply based on the plan and agreement.

## Important support boundary

The support assistant can explain the public cancellation policy, but it cannot cancel a workspace, approve a refund, or confirm the status of a specific account. Those requests should go to human support or the workspace admin flow.`
  },
  {
    slug: "support",
    title: "Contacting Support",
    sourceUrl: "internal://demo-kb/support",
    sourceDomain: "demo-kb",
    content: `# Contacting Support

Northstar Scheduling offers a clear path for prospects, customers, and billing admins to reach the right support channel.

## Standard support

Standard support is available by email and web form for all paid plans. The typical first response target is within one business day.

## Priority support

Team and Enterprise customers receive priority queue handling for production-impacting issues and routing workflow disruptions.

## Sales and pilot questions

Prospects evaluating Northstar Scheduling can use the review or teardown call-to-action on this site to request a pilot walkthrough or support-flow review.

## Best way to get help with account-specific work

For billing changes, invoice issues, workspace access problems, or cancellation requests, contact human support and include:

- workspace name
- billing email
- a short description of the request
- any relevant invoice or renewal date

## What the public support assistant can do

The assistant can answer public documentation questions about plans, billing policies, invoices, support routing, and escalation paths.

## What the public support assistant cannot do

- access a workspace
- change billing details
- cancel a subscription
- issue a refund
- inspect private customer data`
  },
  {
    slug: "escalation",
    title: "Escalation & Support Boundaries",
    sourceUrl: "internal://demo-kb/escalation",
    sourceDomain: "demo-kb",
    content: `# Escalation & Support Boundaries

The Northstar Scheduling support assistant is intentionally limited to public knowledge. It is designed to be helpful without overstating what it can do.

## When the assistant should answer directly

The assistant should answer when the question is supported by published documentation, such as:

- plan comparisons
- pricing structure
- invoice download steps
- billing policy guidance
- support contact routes

## When the assistant should fall back

The assistant should fall back when the available documentation is weak, conflicting, or does not directly support the requested answer.

## When the assistant should escalate to human support

Escalation is required when the user asks for:

- account access
- subscription cancellation on their behalf
- payment method changes
- billing contact updates
- refunds
- anything that depends on private workspace data

## Promise to the user

The assistant should never pretend to have access to customer accounts or private billing systems. It should clearly say when a request needs a human or an authenticated admin path.

## Citation policy

Supported answers should reference the source documents that back the answer so the user can verify the guidance quickly.`
  }
];

export const bundledDemoSources: IngestSource[] = bundledDemoKnowledgeBase.map((document) => ({
  kind: "inline",
  label: document.title,
  title: document.title,
  url: document.sourceUrl,
  sourceDomain: document.sourceDomain,
  content: document.content
}));
