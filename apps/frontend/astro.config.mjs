import { defineConfig, envField, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  output: "static",
  base: process.env.BASE_PATH ?? "/",
  site: process.env.SITE_URL || "http://localhost:4321",
  env: {
    schema: {
      PUBLIC_RUM_APP_MONITOR_ID: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      PUBLIC_RUM_IDENTITY_POOL_ID: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
    },
  },
  integrations: [icon(), sitemap()],
  fonts: [
    {
      name: "Noto Serif JP",
      cssVariable: "--font-noto-jp",
      provider: fontProviders.google(),
      weights: [400, 600, 700],
      styles: ["normal"],
      subsets: ["latin", "japanese"],
      fallbacks: ["serif"],
      optimizedFallbacks: false,
      display: "block",
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    // Enable polling so Vite detects file changes through Docker volume mounts.
    server: {
      watch: {
        usePolling: true,
      },
    },
  },
});
