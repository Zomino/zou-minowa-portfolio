import { describe, expect, it } from "vitest";

import { MAX_INPUT_CHARS, chatRequestSchema } from "./contract";

const parse = (body: unknown) => chatRequestSchema.safeParse(body);

describe("chatRequestSchema", () => {
  it("accepts a valid request and trims message content", () => {
    const result = parse({
      messages: [{ role: "user", content: "  Tell me about Zou  " }],
      pageSlug: "projects",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.messages.at(0)?.content).toBe("Tell me about Zou");
    }
  });

  it("accepts a request without a pageSlug", () => {
    expect(parse({ messages: [{ role: "user", content: "Hi" }] }).success).toBe(
      true,
    );
  });

  it("rejects an empty message list", () => {
    expect(parse({ messages: [] }).success).toBe(false);
  });

  it("rejects a non object body", () => {
    expect(parse(null).success).toBe(false);
  });

  it("rejects when the last message is not from the user", () => {
    expect(
      parse({ messages: [{ role: "assistant", content: "Hello" }] }).success,
    ).toBe(false);
  });

  it("rejects a whitespace only message", () => {
    expect(
      parse({ messages: [{ role: "user", content: "   " }] }).success,
    ).toBe(false);
  });

  it("rejects a non string pageSlug", () => {
    expect(
      parse({ messages: [{ role: "user", content: "Hi" }], pageSlug: 42 })
        .success,
    ).toBe(false);
  });

  it("rejects a message that exceeds the input cap", () => {
    const content = "a".repeat(MAX_INPUT_CHARS + 1);

    expect(parse({ messages: [{ role: "user", content }] }).success).toBe(
      false,
    );
  });
});
