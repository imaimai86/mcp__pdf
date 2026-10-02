import { renderHtmlToPdf } from '../utils/browser.js';
import type { ResolvedInput, ConvertOptions } from '../types.js';

const MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  bmp: 'image/bmp',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

export async function convertImageToPdf(
  input: ResolvedInput,
  options?: ConvertOptions
): Promise<Buffer> {
  const mime = MIME_TYPES[input.extension] ?? 'image/png';

  let imgTag: string;

  if (input.extension === 'svg') {
    // Embed SVG directly for best rendering
    const svgContent = input.buffer.toString('utf-8');
    imgTag = `<div class="svg-container">${svgContent}</div>`;
  } else {
    const base64 = input.buffer.toString('base64');
    imgTag = `<img src="data:${mime};base64,${base64}" />`;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  .svg-container {
    max-width: 100%;
    display: flex;
    justify-content: center;
  }
  .svg-container svg {
    max-width: 100%;
    height: auto;
  }
</style>
</head>
<body>${imgTag}</body>
</html>`;

  return renderHtmlToPdf(html, options);
}
