declare module "gray-matter" {
  interface Frontmatter {
    title: string;
    description: string;
    tags?: string[];
    link?: string;
    github?: string;
    date?: string | Date;
  }

  interface GrayMatterFile {
    data: Frontmatter;
    content: string;
  }

  export default function matter(input: string): GrayMatterFile;
}
