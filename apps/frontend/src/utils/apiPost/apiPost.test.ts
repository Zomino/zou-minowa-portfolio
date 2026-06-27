import { afterEach, describe, expect, it, vi } from "vitest";
import axios from "axios";

import { apiPost } from "./apiPost";

vi.mock("axios");
afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("apiPost", () => {
  it("returns the status and body on success", async () => {
    vi.mocked(axios.post).mockResolvedValue({
      status: 200,
      data: { reply: "Hi" },
    });

    expect(await apiPost("/api/chat", {})).toEqual({
      status: 200,
      body: { reply: "Hi" },
    });
  });

  it("returns the status and body from an HTTP error response", async () => {
    vi.mocked(axios.isAxiosError).mockReturnValue(true);
    vi.mocked(axios.post).mockRejectedValue({
      response: { status: 429, data: { reason: "rate_limited" } },
    });

    expect(await apiPost("/api/chat", {})).toEqual({
      status: 429,
      body: { reason: "rate_limited" },
    });
  });

  it("returns null when there is no response", async () => {
    vi.mocked(axios.isAxiosError).mockReturnValue(false);
    vi.mocked(axios.post).mockRejectedValue(new Error("network"));

    expect(await apiPost("/api/chat", {})).toBeNull();
  });
});
