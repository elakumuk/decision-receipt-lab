import { z } from "zod";

export const classifyDecisionSchema = z.object({
  decision: z.string().min(10, "Decision text must be at least 10 characters."),
  context: z.string().max(500).optional().default(""),
  stakes: z.enum(["low", "medium", "high"]).default("medium"),
});

export const contestDecisionSchema = z.object({
  decision: z.string().min(10, "Decision text must be at least 10 characters."),
  rationale: z.string().min(10, "Rationale must be at least 10 characters."),
  userEmail: z.string().email().optional(),
});

export type ClassifyDecisionInput = z.infer<typeof classifyDecisionSchema>;
export type ContestDecisionInput = z.infer<typeof contestDecisionSchema>;
