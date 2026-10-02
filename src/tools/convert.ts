import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveInput } from '../utils/input.js';
import { convertHtmlToPdf } from '../converters/html.js';
import { convertMarkdownToPdf } from '../converters/markdown.js';
import { convertTextToPdf } from '../converters/text.js';
import { convertDocxToPdf } from '../converters/docx.js';
import { convertImageToPdf } from '../converters/image.js';
import { convertCsvToPdf } from '../converters/csv.js';
import type { ConvertOptions, Converter } from '../types.js';

const CONVERTER_MAP: Record<string, Converter> = {
  html: convertHtmlToPdf,
  htm: convertHtmlToPdf,
  md: convertMarkdownToPdf,
  markdown: convertMarkdownToPdf,
  txt: convertTextToPdf,
  docx: convertDocxToPdf,
  png: convertImageToPdf,
  jpg: convertImageToPdf,
  jpeg: convertImageToPdf,
  gif: convertImageToPdf,
  svg: convertImageToPdf,
  bmp: convertImageToPdf,
  webp: convertImageToPdf,
  csv: convertCsvToPdf,
};

export async function handleConvertToPdf(params: {
  filePath?: string;
  base64Content?: string;
  fileName?: string;
  outputPath?: string;
  options?: ConvertOptions;
}): Promise<{ text: string; base64?: string; outputPath?: string }> {
  const input = await resolveInput(params);

  const converter = CONVERTER_MAP[input.extension];
  if (!converter) {
    throw new Error(
      `No converter for ".${input.extension}". Supported: ${Object.keys(CONVERTER_MAP).join(', ')}`
    );
  }

  const pdfBuffer = await converter(input, params.options);

  if (params.outputPath) {
    const outPath = path.resolve(params.outputPath);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, pdfBuffer);
    return {
      text: `Converted ${input.fileName} (${input.extension}) to PDF. Saved to: ${outPath} (${formatSize(pdfBuffer.length)})`,
      outputPath: outPath,
    };
  }

  return {
    text: `Converted ${input.fileName} (${input.extension}) to PDF (${formatSize(pdfBuffer.length)})`,
    base64: pdfBuffer.toString('base64'),
  };
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
