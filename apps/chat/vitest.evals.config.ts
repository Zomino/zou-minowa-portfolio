/// <reference types="vitest/config" />
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import { createEvalReporter } from "./evals/utils/createEvalReporter/createEvalReporter";

const resultsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "evals",
  "results",
);

export default defineConfig({
  test: {
    environment: "node",
    include: ["evals/evals.ts"],
    testTimeout: 60_000,
    reporters: ["default", createEvalReporter({ resultsDir })],
  },
});
