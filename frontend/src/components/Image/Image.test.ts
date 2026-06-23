import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import Image from "./Image.astro";
import projectImage from "../../assets/test-fixtures/placeholder.svg";

describe("Image", () => {
  it("renders the image with required alt text", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Image, {
      props: {
        src: projectImage,
        alt: "Placeholder screenshot",
        height: projectImage.height,
        width: projectImage.width,
      },
    });

    expect(html).toContain('alt="Placeholder screenshot"');
  });

  it("sets width and height attributes to prevent layout shift", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Image, {
      props: {
        src: projectImage,
        alt: "Placeholder screenshot",
        height: projectImage.height,
        width: projectImage.width,
      },
    });

    expect(html).toContain(`width="${projectImage.width}"`);
    expect(html).toContain(`height="${projectImage.height}"`);
  });
});
