import { renderHtmlToPdf } from '../utils/browser.js';
import type { ResolvedInput, ConvertOptions } from '../types.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function convertTextToPdf(
  input: ResolvedInput,
  options?: ConvertOptions
): Promise<Buffer> {
  const text = input.buffer.toString('utf-8');
  const escaped = escapeHtml(text);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; padding: 0; }
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 12px;
    line-height: 1.5;
    color: #24292e;
  }
</style>
</head>
<body><pre>${escaped}</pre></body>
</html>`;

  return renderHtmlToPdf(html, options);
}
