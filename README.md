# React JSON Viewer & Editor

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/your-username/react-json-viewer-editor/ci.yml)]()
[![Tests](https://img.shields.io/github/actions/workflow/status/your-username/react-json-viewer-editor/test.yml?label=tests)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

A **modern, fast, and accessible JSON Viewer & Editor** built with **React, TypeScript, Vite, and Tailwind CSS**.
Easily **load, view, validate, search, edit, and export JSON** with support for **large files (10–20MB)**, a polished UI, and full keyboard navigation.

👉 Try it live: [Demo Page](#) *(add link once deployed)*

---

## ✨ Features

* **Load JSON**

  * Paste, drag & drop `.json`, or fetch via URL
  * Real-time validation with precise error messages

* **Tree Viewer**

  * Collapsible tree with lazy rendering
  * Expand/collapse all or to a specific depth
  * Type badges, key counts, array lengths, and value previews

* **Search & Filter**

  * Global search with match count and next/prev navigation
  * Filter by key, value, or type

* **Editing**

  * Inline editing for keys/values with validation
  * Add/remove nodes, reorder array items
  * Pretty-print / Minify toggle

* **Utilities**

  * Copy value, key, or JSONPath
  * Download JSON, copy full JSON
  * Recent files / tabs to manage multiple docs

* **UX & Theming**

  * Dark/light mode (system default)
  * Responsive layout, sticky toolbar
  * Keyboard shortcuts + Help modal

* **Performance**

  * Virtualized rendering for large payloads
  * Parsing & validation off main thread (Web Worker)
  * Debounced expensive operations

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (>= 18)
* [pnpm](https://pnpm.io/) or npm/yarn

### Install & Run Locally

```bash
# Clone repo
git clone https://github.com/your-username/react-json-viewer-editor.git
cd react-json-viewer-editor

# Install deps
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test
```

### Build for Production

```bash
pnpm build
pnpm preview
```

The build output will be in `dist/`, ready to deploy to any static host (Netlify, Vercel, GitHub Pages, etc.).

---

## 🧪 Testing

* **Unit tests** with [Vitest](https://vitest.dev/) + [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)
* **End-to-end tests** for load → view → search → edit → export

```bash
pnpm test
```

---

## 📦 Tech Stack

* **Framework:** React + TypeScript
* **Bundler:** Vite
* **Styling:** Tailwind CSS
* **State/Data:** React Query + lightweight state
* **Testing:** Vitest + React Testing Library
* **Accessibility:** WCAG 2.1 AA compliance

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

* Fork the repo
* Create a new branch (`feature/my-feature`)
* Commit changes
* Submit a PR

Check out the [issues](../../issues) for things to work on.

---

## 🌟 Acknowledgements

Inspired by [jsonviewer.stack.hu](http://jsonviewer.stack.hu) and other JSON tools.
Special thanks to the open-source community ❤️
