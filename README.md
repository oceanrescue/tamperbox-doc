# Tamperbox documentation

Public Astro and Starlight documentation for [Tamperbox](https://tamperbox.dev), intended for `https://docs.tamperbox.com`.

## Local development

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

## Verify

```sh
npm run check
npm run build
```

## Documentation architecture

- MDX pages live in `src/content/docs`.
- Astro Starlight provides routing, navigation, search, code rendering, and accessibility foundations.
- Tamperbox design tokens and documentation-specific composition live in `src/styles/tamperbox.css`.
- Every published page has a generated Markdown mirror.
- `/llms.txt` provides a compact agent index.
- `/llms-full.txt` provides the complete public documentation corpus.
- GitHub Pages deployment is defined in `.github/workflows/deploy.yml`.
- `public/CNAME` targets `docs.tamperbox.com`.

## Public repository setup

Create `oceanrescue/tamperbox-doc` as a public GitHub repository, then add it as the local `origin` and push `main`. In the repository settings, select GitHub Actions as the Pages source. Configure DNS for `docs.tamperbox.com` after the Pages deployment is available.

## License

MIT
