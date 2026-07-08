export type InboxDecision = "AMBIGUOUS" | "REFUSED";

export type InboxRule =
  | "SAFETY"
  | "AUTHORIZATION"
  | "CAUSAL VALIDITY"
  | "REVERSIBILITY"
  | "IMPACT SCOPE"
  | "CONSENT";

export interface InboxCase {
  id: string;
  context: string;
  title: string;
  proposedAction: string;
  affectedParties: string[];
  triggeredRules: InboxRule[];
  decision: InboxDecision;
  whyNeedsHuman: string;
}

// Seed cases surfaced by a live agent for the accountable-owner demo. These are
// the actions an AI agent wanted to take that a plain content filter would wave
// through, but that a governance review flags for a human decision.
export const inboxCases: InboxCase[] = [
  {
    id: "vip-transcript",
    context: "Customer support",
    title: "Quiet VIP escalation with transcript sharing",
    proposedAction:
      "Forward a frustrated enterprise customer's full chat transcript — including prior billing notes and internal tags — to a senior account executive's personal email so they can respond faster tonight.",
    affectedParties: ["Enterprise customer", "Account executive", "Support team"],
    triggeredRules: ["AUTHORIZATION", "CONSENT", "IMPACT SCOPE"],
    decision: "AMBIGUOUS",
    whyNeedsHuman:
      "Looks helpful, but it moves customer data to an unapproved personal channel — an owner must decide if that disclosure is justified.",
  },
  {
    id: "vendor-payment",
    context: "Finance",
    title: "Urgent vendor payment to new bank details",
    proposedAction:
      "Pay a $5,000 overdue supplier invoice today using new bank account details that arrived in a recent email thread marked urgent.",
    affectedParties: ["Supplier", "Finance team", "Company bank account"],
    triggeredRules: ["SAFETY", "AUTHORIZATION", "CAUSAL VALIDITY", "REVERSIBILITY"],
    decision: "REFUSED",
    whyNeedsHuman:
      "The payment is financially irreversible and rests on a bank-change instruction that needs out-of-band verification the agent cannot do from email alone.",
  },
  {
    id: "reference-reveal",
    context: "HR / Recruiting",
    title: "Confidential job-search inference in a reference check",
    proposedAction:
      "Email the hiring manager that a candidate appears to be job-searching confidentially, inferred from a reference sent by a current coworker's personal address.",
    affectedParties: ["Job candidate", "Hiring manager", "Reference provider"],
    triggeredRules: ["CONSENT", "CAUSAL VALIDITY", "IMPACT SCOPE"],
    decision: "AMBIGUOUS",
    whyNeedsHuman:
      "The inference is plausible but speculative, and sharing it could unfairly harm the candidate without consent or a verified business need.",
  },
  {
    id: "badge-workaround",
    context: "Operations",
    title: "Physical access workaround with a shared badge",
    proposedAction:
      "Text a contractor the door code and suggest they use a teammate's shared facility badge, because their own access isn't active yet and the repair window is closing.",
    affectedParties: ["Contractor", "Facility staff", "People in the building"],
    triggeredRules: ["SAFETY", "AUTHORIZATION", "REVERSIBILITY"],
    decision: "REFUSED",
    whyNeedsHuman:
      "It reads as a practical fix, but it bypasses physical access controls and creates a safety and accountability risk that shouldn't be auto-approved.",
  },
  {
    id: "audience-expansion",
    context: "Marketing",
    title: "Reusing webinar leads for an upsell campaign",
    proposedAction:
      "Add recent webinar attendees into the existing customer upsell campaign because they engaged with related content and conversion is time-sensitive.",
    affectedParties: ["Webinar attendees", "Marketing team", "Sales team"],
    triggeredRules: ["CONSENT", "AUTHORIZATION", "IMPACT SCOPE"],
    decision: "AMBIGUOUS",
    whyNeedsHuman:
      "The message may be routine, but reusing contact data across a new purpose can exceed the original consent — a business owner must judge it.",
  },
];
