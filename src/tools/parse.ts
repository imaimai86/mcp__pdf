import pdfParse from 'pdf-parse';
import { PDFDocument } from 'pdf-lib';
import { resolveInput } from '../utils/input.js';

export async function handleParsePdf(params: {
  filePath?: string;
  base64Content?: string;
  fileName?: string;
  pageRange?: { start?: number; end?: number };
}): Promise<{
  text: string;
  pageCount: number;
  metadata: Record<string, string | undefined>;
  info: string;
}> {
  const input = await resolveInput({ ...params, fileName: params.fileName ?? 'document.pdf' });

  if (input.extension !== 'pdf') {
    throw new Error(`Expected a PDF file, got .${input.extension}`);
  }

  let bufferToProcess = input.buffer;

  // If page range specified, extract those pages first
  if (params.pageRange) {
    const doc = await PDFDocument.load(input.buffer);
    const totalPages = doc.getPageCount();
    const start = Math.max(0, (params.pageRange.start ?? 1) - 1);
    const end = Math.min(totalPages, params.pageRange.end ?? totalPages);

    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(doc, Array.from({ length: end - start }, (_, i) => start + i));
    pages.forEach(page => newDoc.addPage(page));

    bufferToProcess = Buffer.from(await newDoc.save());
  }

  const parsed = await pdfParse(bufferToProcess);

  // Get full metadata from pdf-lib
  const fullDoc = await PDFDocument.load(input.buffer);
  const pageCount = fullDoc.getPageCount();

  const metadata: Record<string, string | undefined> = {
    title: fullDoc.getTitle(),
    author: fullDoc.getAuthor(),
    subject: fullDoc.getSubject(),
    creator: fullDoc.getCreator(),
    producer: fullDoc.getProducer(),
    creationDate: fullDoc.getCreationDate()?.toISOString(),
    modificationDate: fullDoc.getModificationDate()?.toISOString(),
  };

  const rangeNote = params.pageRange
    ? ` (pages ${params.pageRange.start ?? 1}-${params.pageRange.end ?? pageCount})`
    : '';

  return {
    text: parsed.text,
    pageCount,
    metadata,
    info: `Parsed ${input.fileName}${rangeNote}: ${pageCount} pages, ${parsed.text.length} characters extracted`,
  };
}
