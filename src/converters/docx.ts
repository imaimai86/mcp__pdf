import mammoth from 'mammoth';
import { renderHtmlToPdf } from '../utils/browser.js';
import type { ResolvedInput, ConvertOptions } from '../types.js';

export async function convertDocxToPdf(
  input: ResolvedInput,
  options?: ConvertOptions
): Promise<Buffer> {
  const result = await mammoth.convertToHtml({ buffer: input.buffer });

  if (result.messages.length > 0) {
    const warnings = result.messages
      .filter(m => m.type === 'warning')
      .map(m => m.message);
    if (warnings.length > 0) {
      console.error('DOCX conversion warnings:', warnings.join('; '));
    }
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
  }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background: #f5f5f5; }
  img { max-width: 100%; height: auto; }
  p { margin: 0.5em 0; }
</style>
</head>
<body>${result.value}</body>
</html>`;

  return renderHtmlToPdf(html, options);
}
