import { z } from "zod";

export const MAX_INPUT_CHARS = 1000;

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(MAX_INPUT_CHARS),
      }),
    )
    .min(1)
    .refine((messages) => messages.at(-1)?.role === "user"),
  pageSlug: z.string().optional(),
});

const responseSchema = z.object({
  reply: z.string(),
});

const errorSchema = z.object({
  reason: z.enum([
    "invalid_request",
    "rate_limited",
    "budget_exhausted",
    "unavailable",
  ]),
  message: z.string(),
});

export interface ChatContract {
  request: z.infer<typeof chatRequestSchema>;
  response: z.infer<typeof responseSchema>;
  error: z.infer<typeof errorSchema>;
}
