# Modern JSON Viewer & Editor

> Fast, accessible JSON Viewer & Editor — React + TypeScript + Vite + Tailwind

**Live demo / repo:** https://github.com/hanoj-budime/modern-json-viewer *(replace with your repo URL if different)*

---

## What’s included (latest)

This project is a production-focused JSON viewer/editor with features and UX improvements added incrementally. Recent changes included:

- **Modern single-line SearchBar** with advanced search options (key / value / type), regex, case-sensitivity, Next/Prev navigation, and match-preview panel.
- **Sticky header** containing the SearchBar and theme toggle (light/dark) with `backdrop-blur` effect.
- **Sticky toolbar** below the header for core actions (Pretty / Minify / Download).
- **Fixed footer** at the bottom with personal branding (Hanoj Budime) and a GitHub link; layout adjusted so content never overlaps the footer.
- **TreeViewer & TreeNode**: recursive tree view with
  - Syntax highlighting (colors for keys, strings, numbers, booleans, null),
  - Type badges (object/array/string/etc.),
  - Lazy expansion, but children render when collapsed to support global Expand All / Expand to Path operations,
  - Expand All / Collapse All via context signals.
- **Search → jump-to** integration: selecting a search result expands ancestors, highlights the node, and scrolls it into view.
- **Web Worker parsing** with a synchronous fallback for test/SSR environments.
- **Vitest** configuration fixes so `.tsx` files are correctly transformed in tests (avoid `Unexpected token (1:0)`).
- **Improved dev & test scripts** and additional unit tests for core utilities and components.

---

## Quick start (dev)

Requirements: Node 18+ (or compatible), npm / pnpm / yarn.

```bash
# clone
git clone https://github.com/hanoj-budime/modern-json-viewer.git
cd modern-json-viewer

# install
npm install
# or pnpm install

# run dev server
npm run dev

# build
npm run build

# preview production build
npm run preview

# run tests
npm run test
```

---

## Project structure (key files)

```
src/
├─ main.tsx
├─ App.tsx                # header, search, toolbar, layout, footer
├─ styles/index.css
├─ components/
│  ├─ Editor.tsx
│  ├─ SearchBar.tsx       # single-line modern search bar
│  ├─ Toolbar.tsx
│  ├─ TreeViewer.tsx
│  ├─ TreeNode.tsx        # colored node rendering, expand/collapse, selected highlight
│  └─ HelpModal.tsx
├─ hooks/
│  └─ useParserWorker.ts  # Web Worker parse with fallback
├─ workers/
│  └─ parser.worker.ts
├─ utils/
│  └─ jsonUtils.ts
└─ types.d.ts

public/
├─ demo-data/
│  ├─ small.json
│  ├─ medium.json
│  └─ large.json

tests/
├─ parser.spec.ts
├─ treeviewer.spec.tsx
└─ utils.spec.ts
```

---

## Features & UX

- Paste, upload `.json`, or fetch from URL (with CORS guidance)
- Real-time validation with human-friendly errors
- Tree viewer with color-coded keys & values
- Expand / Collapse all and Expand-to-path
- Search (advanced options) + jump-to + highlight
- Inline editing scaffolding (quick to enable: Editor/TreeNode)
- Pretty / Minify, Download `.json`, Copy clipboard utilities
- Dark/light theme toggle (persisted to `localStorage` and applied to `<html>` for correct Tailwind `dark:` classes)
- Performance: parsing off-main-thread, memoized nodes, virtualization-ready (react-window included)

---

## Tests

This project uses **Vitest** + **@testing-library/react**. The Vite `test` configuration ensures `.tsx` is transformed correctly in test runs.

Run tests:
```bash
npm run test
```

Add tests in `tests/` for components or utilities as needed. Existing tests cover parser utilities and TreeViewer rendering.

---

## SEO-friendly hosting (recommendation)

**Recommended quick deploy:** Cloudflare Pages (free forever, global CDN)

### Steps (Cloudflare Pages)
1. Push the repo to GitHub.
2. Create a Cloudflare Pages project and connect the repo.
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add `/_redirects` file for SPA fallback if using client-side routing:
   ```
   /* /index.html 200
   ```
5. Add `public/robots.txt` and `public/sitemap.xml` (or generate sitemap after build).
6. Add social preview image `public/og-image.png` (1200×630) and meta tags in `index.html`.

**Alternative free hosts:** Netlify, GitHub Pages (use gh-pages), or Vercel (free tier; better if you migrate to Next.js for SSR).

---

## SEO checklist (do this before deploy)

- Add meta title & description in `index.html` or server-side head.
- Add Open Graph and Twitter card meta tags.
- Provide `sitemap.xml` and `robots.txt`.
- Provide `og-image.png` at `public/`.
- Submit sitemap to Google Search Console and Bing Webmaster Tools.

---

## Deployment tips (CI)

Example GitHub Actions (auto-deploy to Cloudflare Pages) — use Cloudflare Pages native Git integration or GitHub Action to upload the `dist/` folder.

---

## Troubleshooting & common fixes

- **Vitest parses `.tsx` as JS**: Ensure `vite.config.ts` includes a `test` block with `transformMode.web` and that `@vitejs/plugin-react` is enabled. Also include `tests` in `tsconfig.json` `include`.
- **Worker fails in tests/SSR**: `useParserWorker` includes a runtime guard and synchronous fallback if `Worker` is not available.
- **Tailwind dark mode not applying**: Ensure `darkMode: 'class'` in `tailwind.config.cjs` and that the `dark` class is toggled on the `<html>` element (this project applies it in `App.tsx`).

---

## License

This repository uses the **MIT License** by default. Replace with **Apache-2.0** if you prefer patent protection.

---

## About / Contact

Built by **Hanoj Budime** — Frontend Engineer. GitHub: https://github.com/hanoj-budime