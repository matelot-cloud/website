# matelot-cloud/website

The public website of [Matelot](https://matelot-cloud.github.io/website/): landing page and documentation, published to
GitHub Pages by `.github/workflows/pages.yml` on every push to `main`.

| Path | What | Edited by |
| --- | --- | --- |
| `content.json` | every string of the landing page: hero, features, integrations, **pricing (indicative)**, FAQ, links; `org` names the GitHub organization once and `{{org}}` stands for it in every URL | people — this is the one file to change for marketing text |
| `tools/landing.mjs` | the page structure on the TemplateMo 621 "Luminary" template | people, rarely |
| `assets/` | logo, favicon, `matelot.css` (our styles), `vendor/` (template stylesheet, script, images — credit link required, see `assets/vendor/LICENSE.md`) | people |
| `docs/latest/`, `docs/vX.Y/` | the generated documentation: `latest` follows the platform's `main`, one folder per release line | **the platform's workflows only** — never by hand (the next sync overwrites it) |
| `404.html` | the not-found page | people |

Everything else in the site (`docs/versions.json`, `docs/index.html`, `sitemap.xml`, `robots.txt`, `CNAME`) is generated
at build time.

## Build locally

```bash
node tools/test.mjs     # checks the landing against content.json and the docs folders
node tools/build.mjs    # → dist/ ; fails on any link or anchor without a target
npx serve dist          # or: python3 -m http.server -d dist 8080
```

Node 22, no dependencies to install.

## GitHub Pages source — the only supported setting is "GitHub Actions"

Settings → Pages → Source must be **GitHub Actions** (`build_type=workflow`). GitHub resets it to the legacy branch
build (`main`, root) on its own in some situations — observed twice right after the custom domain was saved — and the
site then shows this README instead of the landing page. `pages.yml` heals it: the deploy job reads the setting and
puts `build_type=workflow` back before every deploy, on each push to `main`, on manual runs, and on the
`docs-synced` dispatch the platform's `docs-sync` / `release` workflows send after pushing docs. If the healing step is
refused (403), add a repository secret `PAGES_ADMIN_TOKEN` (fine-grained PAT, Pages: read and write on this repository);
the step prefers it over `GITHUB_TOKEN`. **Do not edit the custom domain in the Pages UI** — set `SITE_DOMAIN` (below)
and let the build write `CNAME`; a UI edit is what resets the source.

## Custom domain

One setting: the repository variable **`SITE_DOMAIN`** (Settings → Secrets and variables → Actions → Variables).
Empty (the default) builds for `https://matelot-cloud.github.io/website`. Set it to `matelot.cloud` once the DNS points at
GitHub Pages (`A`/`AAAA` records for the apex, or a `CNAME` to `matelot-cloud.github.io`), and the build writes the
`CNAME` file, the sitemap and the social-preview URLs for that domain; also enter the domain under Settings → Pages so
GitHub provisions the certificate. Links inside the site are relative, so nothing else changes.

## Where the documentation comes from

The Markdown sources live in the private platform repository (`docs/`). Its workflows render them and push the result
here: every push to the platform's `main` updates `docs/latest/`; every release `vX.Y.Z` writes `docs/vX.Y/` and
`latest`. The version switcher on every docs page is built from the folders present under `docs/`.
Questions and corrections about the documentation: [GitHub Discussions](https://github.com/matelot-cloud/matelot/discussions)
or an issue in [matelot-cloud/matelot](https://github.com/matelot-cloud/matelot/issues).

## Licence

The site content (text, logo, `matelot.css`, `tools/`) is © Matelot. The page template is
[TemplateMo 621 Luminary](https://templatemo.com/tm-621-luminary), used under its licence (credit link kept in the
footer); the background images are from Unsplash.
