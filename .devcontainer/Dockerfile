# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
ARG PNPM_VERSION=10.11.0
ARG VERCEL_VERSION=50.1.3
ARG TERRAFORM_VERSION=1.9.8

FROM mcr.microsoft.com/devcontainers/typescript-node:1-${NODE_VERSION}-bullseye

ARG TERRAFORM_VERSION

RUN corepack enable \
  && corepack prepare pnpm@${PNPM_VERSION} --activate \
  && npm install -g vercel@${VERCEL_VERSION} \
  && npm cache clean --force

RUN apt-get update \
  && apt-get install -y gnupg software-properties-common \
  && wget -O- https://apt.releases.hashicorp.com/gpg \
     | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg \
  && echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com bullseye main" \
     > /etc/apt/sources.list.d/hashicorp.list \
  && apt-get update \
  && apt-get install -y terraform=${TERRAFORM_VERSION}-* \
  && rm -rf /var/lib/apt/lists/*
