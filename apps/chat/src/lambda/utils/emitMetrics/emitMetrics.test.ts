import { describe, expect, it, vi } from "vitest";

import { buildEmf, emitMetrics } from "./emitMetrics";

describe("buildEmf", () => {
  it("labels a successful outcome by status only", () => {
    const emf = buildEmf({
      status: 200,
      reason: undefined,
      latencyMs: 120,
      timestamp: 1719500000000,
    });

    expect(emf.Outcome).toBe("200");
    expect(emf.Requests).toBe(1);
    expect(emf.Latency).toBe(120);
    expect(emf._aws.Timestamp).toBe(1719500000000);
    expect(emf._aws.CloudWatchMetrics[0]?.Namespace).toBe("ZouChat");
  });

  it("labels a denial by status and reason", () => {
    const emf = buildEmf({
      status: 429,
      reason: "rate_limited",
      latencyMs: 5,
      timestamp: 1,
    });

    expect(emf.Outcome).toBe("429:rate_limited");
  });
});

describe("emitMetrics", () => {
  it("writes the EMF document as JSON to stdout", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const metric = {
      status: 200,
      reason: undefined,
      latencyMs: 10,
      timestamp: 2,
    };

    emitMetrics(metric);

    expect(log).toHaveBeenCalledWith(JSON.stringify(buildEmf(metric)));
    log.mockRestore();
  });
});
