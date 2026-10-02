import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { resolveInput } from '../utils/input.js';

export async function handleMergePdfs(params: {
  files: Array<{
    filePath?: string;
    base64Content?: string;
    fileName?: string;
  }>;
  outputPath?: string;
}): Promise<{ text: string; base64?: string; outputPath?: string }> {
  if (!params.files || params.files.length < 2) {
    throw new Error('At least 2 PDF files are required for merging.');
  }

  const mergedDoc = await PDFDocument.create();
  const fileNames: string[] = [];

  for (const file of params.files) {
    const input = await resolveInput({ ...file, fileName: file.fileName ?? 'document.pdf' });
    if (input.extension !== 'pdf') {
      throw new Error(`Expected PDF file, got .${input.extension} for "${input.fileName}"`);
    }

    const sourceDoc = await PDFDocument.load(input.buffer);
    const pageIndices = Array.from({ length: sourceDoc.getPageCount() }, (_, i) => i);
    const copiedPages = await mergedDoc.copyPages(sourceDoc, pageIndices);
    copiedPages.forEach(page => mergedDoc.addPage(page));
    fileNames.push(input.fileName);
  }

  const pdfBytes = await mergedDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  if (params.outputPath) {
    const outPath = path.resolve(params.outputPath);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, pdfBuffer);
    return {
      text: `Merged ${fileNames.length} PDFs (${fileNames.join(', ')}) into ${outPath}. Total pages: ${mergedDoc.getPageCount()}`,
      outputPath: outPath,
    };
  }

  return {
    text: `Merged ${fileNames.length} PDFs (${fileNames.join(', ')}). Total pages: ${mergedDoc.getPageCount()}`,
    base64: pdfBuffer.toString('base64'),
  };
}
