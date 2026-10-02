import puppeteer, { type Browser } from 'puppeteer';
import type { ConvertOptions } from '../types.js';

let browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.connected) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser && browser.connected) {
    await browser.close();
    browser = null;
  }
}

const PAGE_SIZES: Record<string, { width: string; height: string }> = {
  A4: { width: '210mm', height: '297mm' },
  Letter: { width: '8.5in', height: '11in' },
  Legal: { width: '8.5in', height: '14in' },
};

export async function renderHtmlToPdf(
  html: string,
  options?: ConvertOptions
): Promise<Buffer> {
  const b = await getBrowser();
  const page = await b.newPage();

  try {
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    const size = PAGE_SIZES[options?.pageSize ?? 'A4'];
    const margin = options?.margin ?? {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm',
    };

    const pdfBuffer = await page.pdf({
      width: size.width,
      height: size.height,
      landscape: options?.landscape ?? false,
      margin,
      printBackground: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}

// Cleanup on exit
process.on('exit', () => {
  if (browser?.connected) {
    browser.close().catch(() => {});
  }
});

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) {
  process.on(signal, async () => {
    await closeBrowser();
    process.exit(0);
  });
}
