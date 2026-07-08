import { classifyScenario } from "@/lib/classifier";
import type { CaseFileReceipt, PolicyPackId } from "@/lib/schemas";

export type GuardDecision = CaseFileReceipt["decision"]; // "ADMISSIBLE" | "AMBIGUOUS" | "REFUSED"

export interface GuardOptions {
  policyPack?: PolicyPackId;
  /**
   * Which decisions are blocked BEFORE the action runs.
   * Default: only REFUSED. Set to ["REFUSED", "AMBIGUOUS"] for a stricter gate.
   */
  blockOn?: GuardDecision[];
}

export interface GuardResult {
  allowed: boolean;
  decision: GuardDecision;
  reason: string;
  receipt: CaseFileReceipt;
}

/**
 * Real-time guardrail. Audit a proposed agent action BEFORE it executes.
 *
 * This is the leap from post-hoc receipts to a live gate: instead of recording
 * what an agent already did, `guardAction` returns `allowed: false` when the
 * decision is in `blockOn` (default: REFUSED) so the caller can STOP the action.
 */
export async function guardAction(
  action: string,
  options: GuardOptions = {},
): Promise<GuardResult> {
  const blockOn = options.blockOn ?? ["REFUSED"];
  const receipt = await classifyScenario(action, { policyPack: options.policyPack });
  const allowed = !blockOn.includes(receipt.decision);

  return {
    allowed,
    decision: receipt.decision,
    reason: receipt.summary,
    receipt,
  };
}

export class GuardBlockedError extends Error {
  constructor(public readonly result: GuardResult) {
    super(`Ovrule blocked action (${result.decision}): ${result.reason}`);
    this.name = "GuardBlockedError";
  }
}

/**
 * Drop-in wrapper: turn any async action into a guarded action.
 * The `execute` function only runs if Ovrule admits the action; otherwise it
 * throws GuardBlockedError and the side effect never happens.
 *
 * Example:
 *   await runGuarded(
 *     "Transfer $5000 to a new vendor from an urgent invoice email",
 *     () => bankApi.transfer(...),
 *     { policyPack: "finance" },
 *   );
 */
export async function runGuarded<T>(
  describeAction: string,
  execute: () => Promise<T>,
  options: GuardOptions = {},
): Promise<{ result: T; guard: GuardResult }> {
  const guard = await guardAction(describeAction, options);

  if (!guard.allowed) {
    throw new GuardBlockedError(guard);
  }

  const result = await execute();
  return { result, guard };
}

/**
 * Drop-in tool wrapper. Turn any agent tool/action into a guarded version in one
 * line — the returned function audits the action before running the real tool,
 * so a REFUSED action throws GuardBlockedError and never executes.
 *
 * Example (any agent framework):
 *   const safeTransfer = guardTool(
 *     bankApi.transfer,
 *     (a) => `Transfer $${a.amount} to vendor ${a.to}`,
 *     { policyPack: "finance" },
 *   );
 *   await safeTransfer({ amount: 5000, to: "acct-9931" }); // blocked if REFUSED
 */
export function guardTool<A extends unknown[], R>(
  tool: (...args: A) => Promise<R>,
  describe: (...args: A) => string,
  options: GuardOptions = {},
): (...args: A) => Promise<{ result: R; guard: GuardResult }> {
  return (...args: A) => runGuarded(describe(...args), () => tool(...args), options);
}
