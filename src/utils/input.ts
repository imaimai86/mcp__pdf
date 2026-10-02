import fs from 'node:fs/promises';
import path from 'node:path';
import type { ResolvedInput } from '../types.js';

const SUPPORTED_EXTENSIONS = new Set([
  'md', 'markdown',
  'html', 'htm',
  'txt',
  'docx',
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'webp',
  'csv',
  'pdf',
]);

export async function resolveInput(params: {
  filePath?: string;
  base64Content?: string;
  fileName?: string;
}): Promise<ResolvedInput> {
  const { filePath, base64Content, fileName } = params;

  if (!filePath && !(base64Content && fileName)) {
    throw new Error('Provide either filePath, or base64Content with fileName.');
  }

  let buffer: Buffer;
  let resolvedFileName: string;

  if (filePath) {
    const absolutePath = path.resolve(filePath);
    try {
      buffer = await fs.readFile(absolutePath);
    } catch (err) {
      throw new Error(`Cannot read file at ${absolutePath}: ${(err as Error).message}`);
    }
    resolvedFileName = path.basename(absolutePath);
  } else {
    buffer = Buffer.from(base64Content!, 'base64');
    resolvedFileName = fileName!;
  }

  const ext = path.extname(resolvedFileName).slice(1).toLowerCase();

  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error(
      `Unsupported file extension ".${ext}". Supported: ${[...SUPPORTED_EXTENSIONS].join(', ')}`
    );
  }

  return { buffer, fileName: resolvedFileName, extension: ext };
}
