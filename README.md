# Markdown CV

A web application for maintaining your CV in markdown with live preview, page break indicators, and PDF export.

## Features

- **Markdown-based CV** — Edit `cv.md` in your code editor, see changes live in the browser
- **Live preview** — Auto-polls for file changes every 2 seconds during development
- **Page break indicators** — Visual dashed lines showing where A4 page breaks fall
- **Page count badge** — Green when within 2 pages, red when over
- **PDF export** — One-click export via browser print with a clean print stylesheet
- **Company timeline** — Vertical lines grouping multiple positions within the same company

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and edit `cv.md` in your editor.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start development server with live reload |
| `pnpm build` | Create production build |
| `pnpm start` | Start production server |
| `pnpm test` | Run unit tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm lint` | Run ESLint |

## Project Structure

```
cv.md                          # Your CV in markdown
app/
  page.tsx                     # Main page (server component)
  globals.css                  # Global + Tailwind styles
  cv.css                       # CV screen + print styles
  lib/
    markdown.ts                # Markdown parsing + file hashing
  api/
    cv/route.ts                # API route for polling changes
  components/
    CvPreview.tsx              # Live preview with page break calculation
    Toolbar.tsx                # Page count badge + export button
```

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- unified/remark/rehype (markdown processing)
- Vitest + Testing Library (tests)
