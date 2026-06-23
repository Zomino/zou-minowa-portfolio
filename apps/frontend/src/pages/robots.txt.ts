import { buildRobotsTxt } from "./_utils/buildRobotsTxt/buildRobotsTxt";

export function GET({ site }: { site: URL | undefined }): Response {
  if (!site) {
    throw new Error("Astro `site` must be configured to build robots.txt");
  }

  return new Response(buildRobotsTxt(site), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
