import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { TaskMeta } from "vitest";

export interface EvalMetrics {
  latencyMs: number;
  chatTokens: number;
  judgeTokens: number;
}

declare module "vitest" {
  interface TaskMeta {
    evalMetrics?: EvalMetrics;
  }
}

interface ReportedTestCase {
  name: string;
  parent: { type: string; name?: string };
  meta(): TaskMeta;
  result(): { state: string };
}

interface ReportedTestModule {
  children: { allTests(): Iterable<ReportedTestCase> };
}

interface CaseResult extends EvalMetrics {
  name: string;
  category: string;
  pass: boolean;
}

const buildCaseResult = (testCase: ReportedTestCase) => {
  const metrics = testCase.meta().evalMetrics;

  if (!metrics) {
    return null;
  }

  const parent = testCase.parent;
  const result: CaseResult = {
    name: testCase.name,
    category: parent.type === "suite" ? (parent.name ?? "") : "",
    pass: testCase.result().state === "passed",
    ...metrics,
  };

  return result;
};

const sumBy = (results: CaseResult[], read: (result: CaseResult) => number) =>
  results.reduce((sum, result) => sum + read(result), 0);

const buildSummary = (results: CaseResult[]) => {
  const passed = results.filter((result) => result.pass).length;

  return {
    passed: `${passed}/${results.length}`,
    latencyMs: sumBy(results, (result) => result.latencyMs),
    chatTokens: sumBy(results, (result) => result.chatTokens),
    judgeTokens: sumBy(results, (result) => result.judgeTokens),
  };
};

export const createEvalReporter = ({ resultsDir }: { resultsDir: string }) => {
  const onTestRunEnd = (testModules: ReadonlyArray<ReportedTestModule>) => {
    const results = testModules
      .flatMap((testModule) => [...testModule.children.allTests()])
      .map(buildCaseResult)
      .filter((result) => result !== null);

    if (results.length === 0) {
      return;
    }

    const timestamp = new Date().toISOString().replaceAll(":", "-");

    mkdirSync(resultsDir, { recursive: true });
    writeFileSync(
      join(resultsDir, `eval-${timestamp}.json`),
      JSON.stringify(results, null, 2),
    );

    console.table(results);
    console.table([buildSummary(results)]);
  };

  return { onTestRunEnd };
};
