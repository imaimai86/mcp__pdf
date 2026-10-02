# mcp-pdf

An [MCP](https://modelcontextprotocol.io) server that gives any MCP-compatible client (Claude Code, Claude Desktop, etc.) tools for working with PDF files: converting other formats into PDF, parsing text/metadata out of PDFs, and merging PDFs together.

## Tools

- **`convert_to_pdf`** — Convert Markdown, HTML, plain text, Word (`.docx`), images (`.png`, `.jpg`, `.gif`, `.svg`, `.bmp`, `.webp`), or CSV into a PDF. Accepts a file path or base64-encoded content; configurable page size, orientation, and margins.
- **`parse_pdf`** — Extract text and metadata from a PDF, optionally limited to a page range.
- **`merge_pdfs`** — Combine two or more PDFs (by path or base64) into one output PDF.
- **`pdf_metadata`** — Read metadata and per-page info (dimensions, title, author, page count, etc.) from a PDF.

Every tool accepts input as either an absolute `filePath` or `base64Content` + `fileName`, and writes output to `outputPath` if given, otherwise returns it base64-encoded.

## How it works

- Built on `@modelcontextprotocol/sdk`, communicating over stdio.
- Markdown/HTML/text/CSV are rendered to HTML and converted to PDF via headless Chromium (Puppeteer).
- `.docx` is converted to HTML first (via `mammoth`), then through the same PDF pipeline.
- PDF parsing and merging use `pdf-parse` and `pdf-lib` respectively.

## Development

```bash
npm install
npm run dev      # run from source with tsx
npm run build     # compile TypeScript to dist/
npm start         # run the compiled server
```

## Built with AI, human-reviewed

This server was built using an AI-first, human-in-the-loop approach: Claude generated the initial implementation and iterations, while a human engineer directed the scope, reviewed each change, and verified behavior against real inputs before it was considered done. AI accelerated the build; human judgment decided what shipped.
