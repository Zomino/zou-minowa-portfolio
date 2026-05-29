import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  output: "static",
  site: process.env.SITE_URL ?? "http://localhost:4321",
  integrations: [icon(), sitemap()],
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
