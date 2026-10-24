# Tamperbox documentation

Public Astro and Starlight documentation for [Tamperbox](https://tamperbox.dev), published at [docs.tamperbox.dev](https://docs.tamperbox.dev).

Start at [Getting started](https://docs.tamperbox.dev/getting-started/), connect an agent with the [MCP guide](https://docs.tamperbox.dev/mcp/), or read a tool's method and repair guide under [Tool pages](https://docs.tamperbox.dev/tools/). Every page is also served as Markdown (add `.md` to its path) and listed in [llms.txt](https://docs.tamperbox.dev/llms.txt).

## Local development

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

`npm run dev` is the fast Astro development server with hot reload. To verify the
compiled site through the same Cloudflare static-asset routing used in production:

```sh
npm run dev:worker
```

The Worker preview is available at `http://localhost:8787`.

## Verify

```sh
npm test
npm run check
npm run build
npm run deploy:dry-run
```

`npm run build` also runs the generated-site link gate. It checks internal routes and
fragments, Markdown mirrors, required tool-documentation anchors, and reciprocal
tool links. When the sibling `toolkit-apps` checkout is present, it also checks the
website's `site/pages.json` declarations. Guides may exist before a tool is converted
to the landing layout; landing pages must declare the matching docs URL, and any
explicit docs declaration is checked. Set `TAMPERBOX_SITE_ROOT` to a current website
checkout when the default sibling checkout is on an older branch. Run
`npm run check:links` to repeat the gate without rebuilding.

## Documentation architecture

- MDX pages live in `src/content/docs`.
- Astro Starlight provides routing, navigation, search, code rendering, and accessibility foundations.
- Tamperbox design tokens and documentation-specific composition live in `src/styles/tamperbox.css`.
- Every published page has a generated Markdown mirror.
- `/llms.txt` provides a compact agent index.
- `/llms-full.txt` provides the complete public documentation corpus.
- Cloudflare Worker environments and static-asset routing are defined in `wrangler.jsonc`.
- Production deployment is defined in `.github/workflows/deploy.yml`.

## Cloudflare deployment

The production environment deploys the static Astro build as the `tamperbox-doc`
Worker and attaches the `docs.tamperbox.dev` custom domain. No Worker entrypoint is
needed because Cloudflare serves the generated assets directly.

For a manual deployment after authenticating Wrangler:

```sh
npm run deploy:production
```

For GitHub Actions, add these repository secrets:

- `CLOUDFLARE_API_TOKEN`: a scoped token that can edit Workers Scripts and Workers Routes.
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account containing the `tamperbox.dev` zone.

## Public repository setup

Create `oceanrescue/tamperbox-doc` as a public GitHub repository, then add it as the local `origin` and push `main`. Add the Cloudflare secrets above and create a protected `production` environment if deployment approvals are desired. The first production deployment creates or updates the `docs.tamperbox.dev` custom domain in Cloudflare.

## License

MIT
