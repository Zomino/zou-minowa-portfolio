# OIDC: GitHub Actions to AWS

**Read time:** ~5 minutes

---

## What it is

OpenID Connect (OIDC) is an identity layer built on top of OAuth 2.0. It allows one system to assert the identity of a caller to another system without exchanging a shared secret. In the context of GitHub Actions and AWS, it enables a workflow runner to prove its identity to AWS and receive short-lived credentials, without any long-lived access key ever existing.

---

## The problem it solves

The traditional approach stores an IAM access key ID and secret in GitHub repository secrets, then injects them as environment variables at runtime. Those credentials:

- exist permanently until manually rotated
- are valid from any IP, any time, any context
- must be rotated across every repository that uses them if compromised

OIDC removes the credential entirely. There is no access key to store, leak, or rotate.

---

## How it works

### 1. GitHub mints a JWT for each workflow run

When a workflow starts, GitHub's OIDC provider (`token.actions.githubusercontent.com`) issues a signed JSON Web Token (JWT) to the runner. The token is short-lived (typically valid for minutes) and contains claims describing the exact context of the run.

Key standard claims in the token:

| Claim | Value (example) |
|-------|-----------------|
| `iss` | `https://token.actions.githubusercontent.com` |
| `aud` | `sts.amazonaws.com` |
| `sub` | `repo:Zomino/zou-minowa-portfolio:ref:refs/heads/main` |

The `sub` (subject) claim encodes facts about the run: organisation, repository, and the ref (branch or tag). AWS uses this to decide whether to grant access.

### 2. The workflow presents the JWT to AWS STS

The workflow calls `sts:AssumeRoleWithWebIdentity`, passing the JWT. This is the AWS Security Token Service (STS) API for exchanging a third-party identity token for temporary AWS credentials. The call does not require existing AWS credentials.

### 3. AWS validates the token against the IAM trust policy

For this to succeed, two things must be true:

**AWS trusts GitHub's OIDC provider.** You register GitHub's OIDC issuer URL as an IAM Identity Provider in your AWS account. AWS fetches GitHub's public JWKS (JSON Web Key Set) from the well-known endpoint and uses it to verify the JWT signature.

**The trust policy on the IAM role permits the caller.** The role's assume-role policy includes conditions that match against the token's claims. A typical condition locks the role to a specific repository and branch:

```json
{
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
      "token.actions.githubusercontent.com:sub": "repo:Zomino/zou-minowa-portfolio:ref:refs/heads/main"
    }
  }
}
```

If the signature is valid and the conditions match, STS returns a set of temporary credentials (access key, secret key, session token) scoped to the role's permissions, valid for a short duration (default 1 hour, configurable down to 15 minutes).

### 4. The workflow uses the temporary credentials

The credentials are injected as environment variables for the remainder of the job. Any AWS SDK or CLI call in subsequent steps uses them automatically. When the job ends, the credentials expire and cannot be reused.

---

## Scoping and least privilege

The trust policy is where access control lives. Conditions can be made as narrow as needed:

- **Branch-scoped:** restrict to `refs/heads/main` so only merges to main can deploy
- **Environment-scoped:** use `job_workflow_ref` or GitHub deployment environments for finer control
- **Organisation-wide:** omit the repo portion of `sub` to allow any repo in the org (not recommended for production deploy roles)

The IAM role's permission policy is separate from the trust policy. Limit it to only the AWS actions the workflow actually needs (for example, `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket`, and `cloudfront:CreateInvalidation` for a static site deploy).

---

## What does not change

OIDC does not change how the workflow interacts with AWS after authentication. AWS CLI commands, SDK calls, and Terraform all work identically. The only difference is how the credentials are obtained.

---

## Summary

| | Long-lived access keys | OIDC |
|---|---|---|
| Credential stored in GitHub | Yes (key + secret) | No |
| Credential lifetime | Until manually rotated | Minutes |
| Blast radius if leaked | Permanent until rotated | None, already expired |
| Rotation required | Yes | No |
| AWS setup required | IAM user | OIDC provider + IAM role |

---

## Sources

- [GitHub Docs: Configuring OpenID Connect in Amazon Web Services](https://docs.github.com/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [GitHub Docs: OpenID Connect reference](https://docs.github.com/actions/reference/openid-connect-reference)
- [AWS Docs: AssumeRoleWithWebIdentity](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRoleWithWebIdentity.html)
- [AWS Docs: Create a role for OpenID Connect federation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html)
- [Tinder Tech Blog: Identifying vulnerabilities in GitHub Actions and AWS OIDC configurations](https://medium.com/tinder/identifying-vulnerabilities-in-github-actions-aws-oidc-configurations-8067c400d5b8)
