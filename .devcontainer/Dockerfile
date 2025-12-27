# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
FROM mcr.microsoft.com/devcontainers/typescript-node:1-${NODE_VERSION}-bullseye

# Install tooling for Astro/Tailwind workflows and deployment.
RUN corepack enable \
  && corepack prepare pnpm@latest --activate \
  && npm install -g vercel@latest \
  && npm cache clean --force
