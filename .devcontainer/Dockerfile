# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
ARG PNPM_VERSION=10.11.0
ARG VERCEL_VERSION=50.1.3

FROM mcr.microsoft.com/devcontainers/typescript-node:1-${NODE_VERSION}-bullseye

# Install tooling for Astro/Tailwind workflows and deployment.
RUN corepack enable \
  && corepack prepare pnpm@${PNPM_VERSION} --activate \
  && npm install -g vercel@${VERCEL_VERSION} \
  && npm cache clean --force
