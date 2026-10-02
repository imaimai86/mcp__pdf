import { renderHtmlToPdf } from '../utils/browser.js';
import type { ResolvedInput, ConvertOptions } from '../types.js';

export async function convertHtmlToPdf(
  input: ResolvedInput,
  options?: ConvertOptions
): Promise<Buffer> {
  const html = input.buffer.toString('utf-8');
  return renderHtmlToPdf(html, options);
}
