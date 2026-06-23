# Preview Environments on AWS

**Read time:** ~5 minutes

---

## What they are

A preview environment is an isolated, publicly accessible deployment of a specific branch or pull request. Each PR gets its own URL so reviewers can inspect the built output without checking out the branch locally. On Vercel this happens automatically. On AWS it requires a workflow and a small amount of infrastructure.

---

## Why they matter

Without preview environments, reviewers can only read diffs. Visual regressions, broken layouts, and incorrect asset paths are invisible in code review but obvious in a browser. A preview URL removes the barrier between "looks fine in the diff" and "actually works." It also allows non-technical stakeholders to review content changes without any local setup.

---

## Architecture

Two patterns are viable for a static Astro site on S3 and CloudFront.

There are two phases to this architecture, depending on whether a custom domain is in place.

### Phase 1: before custom domain (path-prefix)

A single S3 bucket holds all preview deployments under per-PR prefixes (`pr-42/index.html`, `pr-43/index.html`). A single CloudFront distribution serves the bucket root. Each PR is accessible at `https://<preview-dist>.cloudfront.net/pr-<number>/`.

```
GitHub Actions (on: pull_request)
    │
    ▼
S3 bucket: zou-minowa-portfolio-previews
    ├── pr-42/
    │    ├── index.html
    │    └── _astro/...
    └── pr-43/
         ├── index.html
         └── _astro/...
    │
    ▼
CloudFront distribution (preview)
    └── default behaviour → S3 origin (no path rewriting)
```

**Why one distribution and not one per PR.** A new CloudFront distribution takes 15 to 20 minutes to propagate globally. Creating one per PR makes the preview URL unusable during that window and complicates teardown. A shared distribution is available immediately for each new prefix.

**Why a path prefix and not a subdomain (pre-domain).** CloudFront distributions have a fixed `*.cloudfront.net` hostname. Creating subdomains on demand requires either a new distribution per PR (slow) or controlling your own DNS zone. Before a custom domain exists, path-prefix is the practical equivalent.

**Why a separate bucket and distribution from production.** Mixing preview content into the production bucket creates risk: a misconfigured deploy could overwrite production files. A separate bucket with its own IAM policy limits the blast radius of any workflow error.

### Phase 2: after custom domain (wildcard subdomain)

Once Route 53 and ACM are in place, the path-prefix workaround can be replaced with clean subdomain URLs. The infrastructure change is:

1. Issue an ACM wildcard certificate for `*.preview.yourdomain.com` (must be in `us-east-1` for CloudFront).
2. Add `*.preview.yourdomain.com` as an alternate domain name (CNAME) on the existing preview distribution.
3. Create a single Route 53 wildcard ALIAS record: `*.preview.yourdomain.com` → preview distribution. One DNS record covers every PR subdomain automatically; no per-PR DNS changes are needed.
4. Add a CloudFront Function that reads the `Host` request header, extracts the PR number from `pr-42.preview.yourdomain.com`, and rewrites the request path to `/pr-42/<original-path>` before forwarding to S3.

```
pr-42.preview.yourdomain.com
    │
    ▼ Route 53 wildcard ALIAS (*.preview.yourdomain.com)
    │
    ▼ CloudFront distribution (preview)
       CloudFront Function: Host header → path rewrite (pr-42/ prefix)
    │
    ▼ S3 bucket (pr-42/index.html, pr-42/_astro/...)
```

This eliminates the `base` path requirement in the Astro build (see below). The Astro site is built as if it lives at the root, and the CloudFront Function handles the prefix mapping transparently. The preview distribution remains a single shared distribution; only Route 53 and the CloudFront Function change.

A second distribution is still required even with a custom domain. The production distribution is scoped to `yourdomain.com` with its own ACM certificate. Adding the `*.preview.yourdomain.com` wildcard to that certificate and distribution is possible in principle, but routing traffic for preview subdomains to a different S3 origin (the preview bucket) would require a CloudFront Function inspecting the `Host` header on the production distribution, mixing preview and production concerns. A dedicated preview distribution with its own origin, cache policies, and IAM scope is simpler and safer.

---

## GitHub Actions workflow structure

Two triggers are needed: one to deploy on PR activity, one to clean up on PR close.

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, closed]
```

Splitting the logic on `github.event.action == 'closed'` inside a single workflow avoids maintaining two files. The deploy path runs on open, synchronise, and reopened. The teardown path runs on closed.

### Deploy path

1. Checkout the branch.
2. Install dependencies and run `pnpm build` with the correct environment variables (see below).
3. Sync `apps/frontend/dist/` to `s3://zou-minowa-portfolio-previews/pr-${{ github.event.number }}/` using `aws s3 sync --delete`.
4. Invalidate the CloudFront cache for `/pr-${{ github.event.number }}/*`.
5. Post a comment on the PR with the preview URL.

The `--delete` flag on `aws s3 sync` removes files from the prefix that no longer exist in the build output. Without it, deleted pages or renamed assets accumulate in the bucket and may be served from stale cache.

### Teardown path

```bash
aws s3 rm s3://zou-minowa-portfolio-previews/pr-${{ github.event.number }}/ --recursive
```

No CloudFront invalidation is needed on teardown because the prefix no longer exists; any cached response will eventually expire, and the URL is no longer shared.

### IAM permissions for the preview role

The preview deploy role needs these S3 permissions scoped to the preview bucket and the relevant prefix:

- `s3:PutObject`
- `s3:DeleteObject`
- `s3:ListBucket`

And one CloudFront permission scoped to the preview distribution:

- `cloudfront:CreateInvalidation`

The teardown action needs only `s3:DeleteObject` and `s3:ListBucket`. If you use OIDC (which this repo already does for production deploys), create a separate IAM role for preview deploys with the trust policy allowing `pull_request` events, not just pushes to `main`.

```json
{
  "Condition": {
    "StringLike": {
      "token.actions.githubusercontent.com:sub": "repo:Zomino/zou-minowa-portfolio:pull_request"
    }
  }
}
```

---

## Environment variables and base path

Astro resolves environment variables at build time. There are no runtime environment variables in a static build. Any variable that affects the output must be set in the GitHub Actions job environment before `pnpm build` runs.

Two variables matter for preview deployments:

**`SITE_URL`** sets the canonical URL used by `@astrojs/sitemap` and any absolute links. For a preview deploy, set it to the CloudFront preview URL including the PR prefix (e.g. `https://<preview-dist>.cloudfront.net/pr-42`). Without a correct `SITE_URL`, the sitemap will contain the wrong origin and any absolute URLs in the build output will point to production.

**`base`** in `astro.config.mjs` tells Astro to prefix all internal links and asset paths with a sub-path. In Phase 1 (path-prefix), set `base: /pr-${PR_NUMBER}` at build time so that links from `index.html` resolve to `/pr-42/about` rather than `/about`. Without this, navigation works only from the index page; any direct URL or internal link will 404 because CloudFront serves the site from a sub-path, not the root. In Phase 2 (wildcard subdomain), the CloudFront Function handles the prefix mapping at the edge, so `base` is not needed and the site builds as normal.

The cleanest way to pass the base path is via an environment variable read in `astro.config.mjs`:

```js
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  // ...
})
```

In the Phase 1 workflow:

```yaml
- run: pnpm build
  working-directory: frontend
  env:
    BASE_PATH: /pr-${{ github.event.number }}
    SITE_URL: https://<preview-dist>.cloudfront.net/pr-${{ github.event.number }}
```

In Phase 2, omit `BASE_PATH` and set `SITE_URL` to the subdomain URL instead.

---

## CloudFront cache behaviour for previews

The preview distribution needs no per-PR cache behaviour configuration. A single default behaviour pointing at the bucket root is sufficient. Assets under `_astro/` in each prefix carry content-hashed filenames and can use a long-TTL cache policy. HTML files (e.g. `pr-42/index.html`) should use a short or zero TTL so that re-deploys of the same PR are visible without a manual invalidation.

The production CloudFront configuration in this repo already uses separate cache policies for `/_astro/*` (long TTL) and HTML (zero TTL). Mirror this structure in the preview distribution.

---

## Access control

Preview URLs on `*.cloudfront.net` are not indexed by search engines by default, but they are publicly accessible to anyone with the URL. For a portfolio site this is generally acceptable.

If access control is required, two options are practical without adding a backend:

| Option | Mechanism | Trade-off |
|---|---|---|
| HTTP Basic Auth | CloudFront Function checks `Authorization` header against a Base64-encoded credential | Credential is hardcoded in the function; rotating it requires redeploying the function |
| CloudFront signed URLs | Requests must include a signature generated from a private key | Requires generating signed URLs server-side or in CI; links expire after a configured duration |

For internal review of a public portfolio, obscurity (an unguessable `.cloudfront.net` subdomain URL shared only in the PR comment) is a reasonable baseline. Add Basic Auth if the site contains draft content that should not be publicly readable before launch.

---

## PR comment

GitHub Actions can post a comment via the `gh` CLI or the `actions/github-script` action. The comment should include the preview URL and, optionally, a link to the build run for context.

```yaml
- name: Post preview URL
  env:
    GH_TOKEN: ${{ github.token }}
  run: |
    gh pr comment ${{ github.event.number }} \
      --body "Preview: https://<preview-dist>.cloudfront.net/pr-${{ github.event.number }}/"
```

The `github.token` secret is available to all workflows without configuration and has write access to PR comments.

---

## Comparison with Vercel

| | Vercel | AWS (Pattern A) |
|---|---|---|
| Preview URL available | Within ~30 seconds | Within ~2 minutes (build + sync + invalidation) |
| URL format | `<branch>.vercel.app` | Phase 1: `<preview-dist>.cloudfront.net/pr-<number>` / Phase 2: `pr-<number>.preview.yourdomain.com` |
| PR comment | Automatic | GitHub Actions step |
| Teardown | Automatic | `aws s3 rm --recursive` on PR close |
| Access control | Vercel auth (team-gated) | CloudFront Function or signed URLs |
| Configuration required | None | One IAM role, one S3 bucket, one CloudFront distribution |

---

## Sources

- [AWS Docs: Use various origins with CloudFront distributions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistS3AndCustomOrigins.html)
- [AWS Docs: Serve private content with signed URLs and signed cookies](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PrivateContent.html)
- [Astro Docs: Using environment variables](https://docs.astro.build/en/guides/environment-variables/)
- [Astro Docs: base configuration](https://docs.astro.build/en/reference/configuration-reference/#base)
- [GitHub Actions: Automatic token authentication](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/automatic-token-authentication)
- [AWS Preview Deployments with GitHub Actions](https://vitaliimelnychuk.medium.com/aws-preview-deployments-with-github-actions-b6b916631124)
- [Proposal: PR docs previews using S3 and CloudFront with OIDC-based GitHub Actions](https://github.com/mlflow/mlflow/wiki/Proposal:-PR-docs-previews-using-S3----CloudFront,-authenticated-&-automated-with-OIDC%E2%80%91based-GitHub-Actions)
