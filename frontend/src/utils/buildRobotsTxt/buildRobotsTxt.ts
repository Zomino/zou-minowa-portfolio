export const buildRobotsTxt = (site: URL): string =>
  `User-agent: *
Allow: /
Sitemap: ${new URL("sitemap-index.xml", site).href}
`;
