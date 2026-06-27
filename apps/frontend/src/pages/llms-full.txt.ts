import { getCollection } from "astro:content";

import { buildLlmsFullTxt } from "./_utils/buildLlmsFullTxt/buildLlmsFullTxt";
import metadata from "@/metadata.json";

export async function GET(): Promise<Response> {
  const projects = await getCollection("projects");
  const journal = await getCollection("journal");
  const body = buildLlmsFullTxt(projects, journal, metadata);

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
