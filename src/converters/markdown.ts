import { marked } from 'marked';
import { renderHtmlToPdf } from '../utils/browser.js';
import type { ResolvedInput, ConvertOptions } from '../types.js';

const GITHUB_STYLE = `
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #24292e;
    max-width: 100%;
    padding: 0;
  }
  h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; }
  h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
  code {
    background: #f6f8fa;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 85%;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  }
  pre {
    background: #f6f8fa;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    line-height: 1.45;
  }
  pre code { background: none; padding: 0; }
  blockquote {
    border-left: 4px solid #dfe2e5;
    color: #6a737d;
    margin: 0;
    padding: 0 1em;
  }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #dfe2e5; padding: 6px 13px; }
  th { background: #f6f8fa; font-weight: 600; }
  tr:nth-child(even) { background: #f6f8fa; }
  img { max-width: 100%; height: auto; }
  a { color: #0366d6; text-decoration: none; }
  hr { border: none; border-top: 1px solid #eaecef; }
  ul, ol { padding-left: 2em; }
</style>
`;

export async function convertMarkdownToPdf(
  input: ResolvedInput,
  options?: ConvertOptions
): Promise<Buffer> {
  const markdown = input.buffer.toString('utf-8');
  const htmlBody = await marked.parse(markdown);

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">${GITHUB_STYLE}</head>
<body>${htmlBody}</body>
</html>`;

  return renderHtmlToPdf(html, options);
}
