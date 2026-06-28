import { describe, expect, it } from "vitest";

import { MAX_INPUT_CHARS, MAX_REPLY_CHARS, chatRequestSchema } from "./contract";

const parse = (request: unknown) => chatRequestSchema.safeParse(request);

describe("chatRequestSchema", () => {
  it("accepts a valid request and trims message content", () => {
    const result = parse({
      body: {
        messages: [{ role: "user", content: "  Tell me about Zou  " }],
        pageSlug: "projects",
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body.messages.at(0)?.content).toBe(
        "Tell me about Zou",
      );
    }
  });

  it("accepts a request without a pageSlug", () => {
    expect(
      parse({ body: { messages: [{ role: "user", content: "Hi" }] } }).success,
    ).toBe(true);
  });

  it("rejects an empty message list", () => {
    expect(parse({ body: { messages: [] } }).success).toBe(false);
  });

  it("rejects a non object request", () => {
    expect(parse(null).success).toBe(false);
  });

  it("rejects when the last message is not from the user", () => {
    expect(
      parse({ body: { messages: [{ role: "assistant", content: "Hello" }] } })
        .success,
    ).toBe(false);
  });

  it("rejects a whitespace only message", () => {
    expect(
      parse({ body: { messages: [{ role: "user", content: "   " }] } }).success,
    ).toBe(false);
  });

  it("rejects a non string pageSlug", () => {
    expect(
      parse({
        body: { messages: [{ role: "user", content: "Hi" }], pageSlug: 42 },
      }).success,
    ).toBe(false);
  });

  it("rejects a user message that exceeds the input cap", () => {
    const content = "a".repeat(MAX_INPUT_CHARS + 1);

    expect(
      parse({ body: { messages: [{ role: "user", content }] } }).success,
    ).toBe(false);
  });

  it("accepts an assistant message longer than the input cap", () => {
    const reply = "a".repeat(MAX_INPUT_CHARS + 1);

    expect(
      parse({
        body: {
          messages: [
            { role: "user", content: "Hi" },
            { role: "assistant", content: reply },
            { role: "user", content: "More" },
          ],
        },
      }).success,
    ).toBe(true);
  });

  it("rejects an assistant message that exceeds the reply cap", () => {
    const reply = "a".repeat(MAX_REPLY_CHARS + 1);

    expect(
      parse({
        body: {
          messages: [
            { role: "assistant", content: reply },
            { role: "user", content: "More" },
          ],
        },
      }).success,
    ).toBe(false);
  });
});
