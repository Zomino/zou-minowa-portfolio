import { getCollection } from "astro:content";

import { buildLlmsTxt } from "./_utils/buildLlmsTxt/buildLlmsTxt";
import metadata from "../metadata.json";

export async function GET({
  site,
}: {
  site: URL | undefined;
}): Promise<Response> {
  if (!site) {
    throw new Error("Astro `site` must be configured to build llms.txt");
  }

  const projects = await getCollection("projects");
  const journal = await getCollection("journal");
  const body = buildLlmsTxt(site, projects, journal, metadata);

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
