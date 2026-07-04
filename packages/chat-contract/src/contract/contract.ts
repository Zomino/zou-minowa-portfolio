import { z } from "zod";

export const MAX_INPUT_CHARS = 1000;
export const MAX_REPLY_CHARS = 4000;

const userMessageSchema = z.object({
  role: z.literal("user"),
  content: z.string().trim().min(1).max(MAX_INPUT_CHARS),
});

const assistantMessageSchema = z.object({
  role: z.literal("assistant"),
  content: z.string().trim().min(1).max(MAX_REPLY_CHARS),
});

export const chatMessageSchema = z.discriminatedUnion("role", [
  userMessageSchema,
  assistantMessageSchema,
]);

export const chatRequestSchema = z.object({
  body: z.object({
    messages: z
      .array(chatMessageSchema)
      .min(1)
      .refine((messages) => messages.at(-1)?.role === "user"),
    pageSlug: z.string().optional(),
  }),
});

export const chatResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal(200),
    body: z.object({ reply: z.string() }),
  }),
  z.object({
    status: z.literal(400),
    body: z.object({
      reason: z.enum(["invalid_request", "blocked"]),
      message: z.string(),
    }),
  }),
  z.object({
    status: z.literal(429),
    body: z.object({
      reason: z.literal("rate_limited"),
      message: z.string(),
      retryAfterMs: z.number(),
    }),
  }),
  z.object({
    status: z.literal(503),
    body: z.object({
      reason: z.enum(["unavailable", "budget_exhausted"]),
      message: z.string(),
    }),
  }),
]);

export interface ChatContract {
  request: z.infer<typeof chatRequestSchema>;
  response: z.infer<typeof chatResponseSchema>;
}
