import { build } from "esbuild";

import { generate } from "./utils/generate/generate.ts";

generate();

await build({
  entryPoints: ["src/lambda/lambda.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: "dist/index.mjs",
  sourcemap: true,
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});
