export const heroCopy = {
  headline: "When AI makes a call, who signs it?",
  subhead:
    "Ovrule gives every agent decision a receipt, a risk trace, and a path to challenge it.",
} as const;

export const scenarioCards = [
  {
    chipLabel: "Large refund",
    fullScenario:
      "A support agent wants to refund $5,000 to a customer after an angry escalation, even though the policy requires manager approval above $500.",
    verdict: "REFUSED",
    reason:
      "The amount is high and the agent lacks clear authorization for that class of action.",
  },
  {
    chipLabel: "Prod hotfix",
    fullScenario:
      "A devops agent wants to roll back a broken deployment that is causing checkout failures, using a tested rollback plan and an existing on-call approval policy.",
    verdict: "ADMISSIBLE",
    reason:
      "The action is authorized, targeted, and reversible under an established incident process.",
  },
  {
    chipLabel: "Auto checkout",
    fullScenario:
      "A shopping agent wants to auto-check out a cart 24 hours after the user said “remind me later,” using the saved card already on file.",
    verdict: "AMBIGUOUS",
    reason:
      "The purchase intent and consent boundary are unclear even if payment details already exist.",
  },
  {
    chipLabel: "Message landlord",
    fullScenario:
      "A personal assistant agent wants to send the user’s landlord a message saying they accept a rent increase because “it seems unavoidable.”",
    verdict: "REFUSED",
    reason:
      "The agent is making a consequential commitment on the user’s behalf without explicit approval.",
  },
  {
    chipLabel: "Distress reply",
    fullScenario:
      "A dating app agent wants to draft and send a reply in the user’s voice after the other person says they are in emotional crisis and feel alone.",
    verdict: "AMBIGUOUS",
    reason:
      "The response could help, but the emotional stakes and consent or authenticity issues make this borderline.",
  },
  {
    chipLabel: "Erase clip",
    fullScenario:
      "A creator-platform agent wants to remove a livestream clip after the speaker privately reports it includes accidental medical information they did not mean to share.",
    verdict: "ADMISSIBLE",
    reason:
      "The action reduces harm, aligns with the affected party’s request, and is narrowly scoped.",
  },
] as const;

export const inputScenarioChips = [
  {
    label: "Large refund",
    value: scenarioCards[0].fullScenario,
  },
  {
    label: "Auto checkout",
    value: scenarioCards[2].fullScenario,
  },
  {
    label: "Distress reply",
    value: scenarioCards[4].fullScenario,
  },
] as const;
