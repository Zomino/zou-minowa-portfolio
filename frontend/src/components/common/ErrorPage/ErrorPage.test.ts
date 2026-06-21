import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import ErrorPage from "./ErrorPage.astro";

describe("ErrorPage", () => {
  it("renders the title", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ErrorPage, {
      props: {
        pageTitle: "Page Not Found",
        title: "Page not found",
        message: "The page you are looking for does not exist.",
      },
    });

    expect(html).toContain("Page not found");
  });

  it("renders the message", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ErrorPage, {
      props: {
        pageTitle: "Page Not Found",
        title: "Page not found",
        message: "The page you are looking for does not exist.",
      },
    });

    expect(html).toContain("The page you are looking for does not exist.");
  });

  it("renders a link to the home page", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ErrorPage, {
      props: {
        pageTitle: "Page Not Found",
        title: "Page not found",
        message: "The page you are looking for does not exist.",
      },
    });

    expect(html).toContain('href="/"');
  });

  it("renders the page title in the document title", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ErrorPage, {
      props: {
        pageTitle: "Page Not Found",
        title: "Page not found",
        message: "The page you are looking for does not exist.",
      },
    });

    expect(html).toContain("Page Not Found");
  });
});
