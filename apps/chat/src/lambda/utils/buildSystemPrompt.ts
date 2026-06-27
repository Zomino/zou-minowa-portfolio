interface Project {
  name: string;
  summary: string;
}

export interface Portfolio {
  name: string;
  headline: string;
  projects: Project[];
}

export const buildSystemPrompt = (portfolio: Portfolio) => {
  const projectLines = portfolio.projects
    .map((project) => `- ${project.name}: ${project.summary}`)
    .join("\n");

  return `You are the assistant for ${portfolio.name}'s portfolio. ${portfolio.headline}

Projects:
${projectLines}

Answer questions about ${portfolio.name} using only the information above. If a question is not covered, say that you do not know.`;
};
