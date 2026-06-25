# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
ARG PNPM_VERSION=10.11.0
ARG VERCEL_VERSION=50.1.3
ARG TERRAFORM_VERSION=1.9.8
ARG AWS_CLI_VERSION=2.22.0
ARG D2_VERSION=0.7.1

FROM mcr.microsoft.com/devcontainers/typescript-node:1-${NODE_VERSION}-bullseye

ARG TERRAFORM_VERSION
ARG AWS_CLI_VERSION
ARG D2_VERSION

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
  && apt-get install -y terraform=${TERRAFORM_VERSION}-* unzip curl \
  && rm -rf /var/lib/apt/lists/*

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64-${AWS_CLI_VERSION}.zip" -o /tmp/awscliv2.zip \
  && unzip /tmp/awscliv2.zip -d /tmp \
  && /tmp/aws/install \
  && rm -rf /tmp/awscliv2.zip /tmp/aws

RUN curl -fsSL "https://github.com/terrastruct/d2/releases/download/v${D2_VERSION}/d2-v${D2_VERSION}-linux-arm64.tar.gz" \
     -o /tmp/d2.tar.gz \
  && tar -C /tmp -xzf /tmp/d2.tar.gz \
  && install "/tmp/d2-v${D2_VERSION}/bin/d2" /usr/local/bin/d2 \
  && rm -rf /tmp/d2.tar.gz "/tmp/d2-v${D2_VERSION}"
