# Copilot Instructions for openjdk-website

## Project Overview
- This is the source for https://www.adoptopenjdk.net, a static website for AdoptOpenJDK.
- The site is built using [Vite](https://vitejs.dev/) and Handlebars templates.
- The `master` branch is the main development branch. Production is deployed from the `gh-pages` branch via CI/CD.

## Key Directories & Files
- `src/` — Main source code (JS, CSS/SCSS, Handlebars templates, assets)
  - `src/handlebars/` — Handlebars templates for all site pages and partials
  - `src/js/` — JavaScript for page logic and interactivity
  - `src/scss/` — SCSS stylesheets, split by page/feature
  - `src/assets/` — Images and static assets
- `public/` — Static files served as-is
- `package.json` — Scripts, dependencies, and build config
- `vite.config.js` — Vite build configuration
- `assemble.sh` — Legacy build script (use Vite for builds)

## Build & Development
- Use Vite for all builds and local development:
  - `npm run dev` — Start local dev server
  - `npm run build` — Build static site for production
  - `npm run preview` — Preview production build locally
- Lint code with `npm run lint` (uses ESLint)
- Do **not** use `assemble.sh` for new workflows; it's for legacy reference only.

## Templating & Patterns
- All HTML is generated from Handlebars templates in `src/handlebars/`.
- Use partials in `src/handlebars/partials/` for shared layout/components (e.g., header, footer, menu).
- Page-specific JS is in `src/js/` and is loaded per template as needed.
- SCSS is modularized by feature/page; import only what is needed.

## Conventions & Practices
- Use ES modules (`type: module` in `package.json`).
- Prefer Vite plugins for asset optimization (see `vite.config.js`).
- Keep all static assets in `src/assets/` or `public/`.
- Do not add new build steps to `assemble.sh`.
- Follow the structure and naming conventions in `src/handlebars/` for new pages/partials.

## External Integrations
- API calls should use the documented endpoints at [api.adoptopenjdk.net](https://api.adoptopenjdk.net).
- For API changes, see the [openjdk-api repo](https://github.com/AdoptOpenJDK/openjdk-api).

## Example: Adding a New Page
1. Create a new Handlebars template in `src/handlebars/`.
2. Add any required partials to `src/handlebars/partials/`.
3. Add page-specific JS to `src/js/` if needed.
4. Add styles to `src/scss/`.
5. Reference assets from `src/assets/`.
6. Update routing/build config if necessary in `vite.config.js`.

---

If any conventions or workflows are unclear, please ask for clarification or check `CONTRIBUTING.md`.
