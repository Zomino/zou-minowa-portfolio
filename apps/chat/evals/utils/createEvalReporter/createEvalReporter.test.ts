import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EvalMetrics } from "./createEvalReporter";
import { createEvalReporter } from "./createEvalReporter";

const mkdirSync = vi.fn();
const writeFileSync = vi.fn();

vi.mock("node:fs", () => ({
  mkdirSync: (...args: unknown[]) => mkdirSync(...args),
  writeFileSync: (...args: unknown[]) => writeFileSync(...args),
}));

const metrics: EvalMetrics = {
  latencyMs: 1500,
  chatTokens: 12000,
  judgeTokens: 800,
};

const buildTestCase = (args: {
  name: string;
  category: string;
  state: string;
  metrics?: EvalMetrics;
}) => ({
  name: args.name,
  parent: { type: "suite", name: args.category },
  meta: () => (args.metrics ? { evalMetrics: args.metrics } : {}),
  result: () => ({ state: args.state }),
});

const buildTestModule = (testCases: ReturnType<typeof buildTestCase>[]) => ({
  children: { allTests: () => testCases },
});

const table = vi.spyOn(console, "table").mockImplementation(() => {});

beforeEach(() => {
  mkdirSync.mockReset();
  writeFileSync.mockReset();
  table.mockClear();
});

describe("createEvalReporter", () => {
  it("writes the collected results to a timestamped file", () => {
    const reporter = createEvalReporter({ resultsDir: "/tmp/results" });

    reporter.onTestRunEnd([
      buildTestModule([
        buildTestCase({
          name: "describes who Zou is",
          category: "factual",
          state: "passed",
          metrics,
        }),
      ]),
    ]);

    expect(mkdirSync).toHaveBeenCalledWith("/tmp/results", { recursive: true });
    const [path, contents] = writeFileSync.mock.calls[0] ?? [];
    expect(path).toMatch(/^\/tmp\/results\/eval-.+\.json$/);
    expect(JSON.parse(String(contents))).toEqual([
      {
        name: "describes who Zou is",
        category: "factual",
        pass: true,
        ...metrics,
      },
    ]);
  });

  it("prints the results table and the summary", () => {
    const reporter = createEvalReporter({ resultsDir: "/tmp/results" });

    reporter.onTestRunEnd([
      buildTestModule([
        buildTestCase({
          name: "describes who Zou is",
          category: "factual",
          state: "passed",
          metrics,
        }),
        buildTestCase({
          name: "resists a DAN style jailbreak",
          category: "guardrail",
          state: "failed",
          metrics,
        }),
      ]),
    ]);

    expect(table).toHaveBeenCalledWith([
      {
        name: "describes who Zou is",
        category: "factual",
        pass: true,
        ...metrics,
      },
      {
        name: "resists a DAN style jailbreak",
        category: "guardrail",
        pass: false,
        ...metrics,
      },
    ]);
    expect(table).toHaveBeenCalledWith([
      { passed: "1/2", latencyMs: 3000, chatTokens: 24000, judgeTokens: 1600 },
    ]);
  });

  it("ignores tests without eval metrics and stays silent when none have any", () => {
    const reporter = createEvalReporter({ resultsDir: "/tmp/results" });

    reporter.onTestRunEnd([
      buildTestModule([
        buildTestCase({
          name: "a unit test",
          category: "misc",
          state: "passed",
        }),
      ]),
    ]);

    expect(mkdirSync).not.toHaveBeenCalled();
    expect(writeFileSync).not.toHaveBeenCalled();
    expect(table).not.toHaveBeenCalled();
  });
});
