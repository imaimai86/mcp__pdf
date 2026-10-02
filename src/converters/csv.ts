import { parse } from 'csv-parse/sync';
import { renderHtmlToPdf } from '../utils/browser.js';
import type { ResolvedInput, ConvertOptions } from '../types.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function convertCsvToPdf(
  input: ResolvedInput,
  options?: ConvertOptions
): Promise<Buffer> {
  const csvText = input.buffer.toString('utf-8');
  const records: string[][] = parse(csvText, {
    relax_column_count: true,
    skip_empty_lines: true,
  });

  if (records.length === 0) {
    throw new Error('CSV file is empty');
  }

  const [header, ...rows] = records;

  const headerHtml = header
    .map(cell => `<th>${escapeHtml(cell)}</th>`)
    .join('');

  const rowsHtml = rows
    .map(
      row =>
        `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
    )
    .join('\n');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 11px; }
  table { border-collapse: collapse; width: 100%; }
  th {
    background: #2d3748;
    color: white;
    padding: 8px 10px;
    text-align: left;
    font-weight: 600;
    font-size: 11px;
  }
  td {
    border-bottom: 1px solid #e2e8f0;
    padding: 6px 10px;
  }
  tr:nth-child(even) { background: #f7fafc; }
  tr:hover { background: #edf2f7; }
</style>
</head>
<body>
<table>
  <thead><tr>${headerHtml}</tr></thead>
  <tbody>${rowsHtml}</tbody>
</table>
</body>
</html>`;

  return renderHtmlToPdf(html, options);
}
