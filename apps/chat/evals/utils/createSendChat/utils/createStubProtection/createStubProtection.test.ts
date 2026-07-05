import { describe, expect, it } from "vitest";

import { createStubProtection } from "./createStubProtection";

describe("createStubProtection", () => {
  it("allows every client", async () => {
    const protection = createStubProtection();

    await expect(protection.check("any-client")).resolves.toEqual({
      allowed: true,
    });
  });

  it("records token usage without effect", async () => {
    const protection = createStubProtection();

    await expect(protection.record({ tokens: 123 })).resolves.toBeUndefined();
  });
});
