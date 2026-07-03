import tsParser from "@typescript-eslint/parser";
import eslintPluginAstro from "eslint-plugin-astro";

import base from "../../eslint.config.mjs";

export default [
  ...base,
  ...eslintPluginAstro.configs["flat/recommended"],
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: [".astro"],
      },
    },
  },
  {
    ignores: [".astro/", ".vercel/"],
  },
];
