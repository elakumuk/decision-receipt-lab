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

// Everyday actions an AI agent might take on your behalf that a plain content
// filter would wave through, but that you'd want to okay first.
export const inboxCases: InboxCase[] = [
  {
    id: "rent-increase",
    context: "Personal · email",
    title: "Accepting a rent increase for you",
    proposedAction:
      "Your assistant is about to email your landlord accepting a 15% rent increase because it “seems unavoidable.”",
    affectedParties: ["You", "Your landlord"],
    triggeredRules: ["AUTHORIZATION", "CONSENT", "REVERSIBILITY"],
    decision: "REFUSED",
    whyNeedsHuman:
      "It commits you to money and a contract you never explicitly approved — that's your call, not the agent's.",
  },
  {
    id: "nonrefundable-trip",
    context: "Personal · travel",
    title: "Auto-booking a non-refundable trip",
    proposedAction:
      "A travel agent is about to book a $1,400 non-refundable flight on your saved card without asking you to confirm.",
    affectedParties: ["You", "Your card"],
    triggeredRules: ["REVERSIBILITY", "CONSENT", "IMPACT SCOPE"],
    decision: "REFUSED",
    whyNeedsHuman:
      "It's irreversible and expensive, and you never confirmed the final purchase.",
  },
  {
    id: "share-ssn",
    context: "Personal · privacy",
    title: "Sharing your SSN to speed up a signup",
    proposedAction:
      "An agent is about to upload a document with your Social Security number and home address to a third-party site to finish a signup faster.",
    affectedParties: ["You"],
    triggeredRules: ["SAFETY", "CONSENT", "IMPACT SCOPE"],
    decision: "REFUSED",
    whyNeedsHuman:
      "It exposes your most sensitive data to a third party you never vetted.",
  },
  {
    id: "post-in-your-voice",
    context: "Personal · social",
    title: "Replying in your voice on social",
    proposedAction:
      "Your agent wants to post a reply in your voice to a heated thread, to “defend your point” while you're away.",
    affectedParties: ["You", "Your followers"],
    triggeredRules: ["IMPACT SCOPE", "CONSENT", "CAUSAL VALIDITY"],
    decision: "AMBIGUOUS",
    whyNeedsHuman:
      "It speaks for you publicly in a charged moment — a reputation call only you should make.",
  },
  {
    id: "delete-account",
    context: "Personal · accounts",
    title: "Canceling an account to “save you money”",
    proposedAction:
      "To cut costs, your agent is about to cancel a subscription and delete the account, which erases your saved history.",
    affectedParties: ["You"],
    triggeredRules: ["REVERSIBILITY", "CONSENT"],
    decision: "AMBIGUOUS",
    whyNeedsHuman:
      "Deleting the account is irreversible, and you may still want the history or the service.",
  },
];
