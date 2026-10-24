# Contributing

Keep changes focused, use current Tamperbox product sources, and preserve warnings and limitations when documenting diagnostics.

Before opening a pull request, run:

```sh
npm run check
npm run build
```

Do not include secrets, production credentials, or sensitive diagnostic inputs in examples.

The build checks generated internal links, fragments, Markdown mirrors and reciprocal tool metadata. By default it compares the sibling `../toolkit-apps` checkout. When that checkout is on another branch, set `TAMPERBOX_SITE_ROOT` to a checkout or exported tree of the website revision being documented, for example `TAMPERBOX_SITE_ROOT=/path/to/current-site npm run build`. External reference availability is checked separately.
