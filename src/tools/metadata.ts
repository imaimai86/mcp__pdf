import { PDFDocument } from 'pdf-lib';
import { resolveInput } from '../utils/input.js';

export async function handlePdfMetadata(params: {
  filePath?: string;
  base64Content?: string;
  fileName?: string;
}): Promise<{
  pageCount: number;
  pages: Array<{ index: number; width: number; height: number }>;
  metadata: Record<string, string | undefined>;
  info: string;
}> {
  const input = await resolveInput({ ...params, fileName: params.fileName ?? 'document.pdf' });

  if (input.extension !== 'pdf') {
    throw new Error(`Expected a PDF file, got .${input.extension}`);
  }

  const doc = await PDFDocument.load(input.buffer);
  const pageCount = doc.getPageCount();

  const pages = Array.from({ length: pageCount }, (_, i) => {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    return { index: i + 1, width: Math.round(width * 100) / 100, height: Math.round(height * 100) / 100 };
  });

  const metadata: Record<string, string | undefined> = {
    title: doc.getTitle(),
    author: doc.getAuthor(),
    subject: doc.getSubject(),
    keywords: doc.getKeywords(),
    creator: doc.getCreator(),
    producer: doc.getProducer(),
    creationDate: doc.getCreationDate()?.toISOString(),
    modificationDate: doc.getModificationDate()?.toISOString(),
  };

  return {
    pageCount,
    pages,
    metadata,
    info: `${input.fileName}: ${pageCount} pages`,
  };
}
