#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { handleConvertToPdf } from './tools/convert.js';
import { handleParsePdf } from './tools/parse.js';
import { handleMergePdfs } from './tools/merge.js';
import { handlePdfMetadata } from './tools/metadata.js';
import { closeBrowser } from './utils/browser.js';

const server = new McpServer({
  name: 'mcp-pdf',
  version: '1.0.0',
});

// --- convert_to_pdf ---
server.tool(
  'convert_to_pdf',
  'Convert files to PDF. Supports: Markdown (.md), HTML (.html), plain text (.txt), Word (.docx), images (.png, .jpg, .gif, .svg, .bmp, .webp), and CSV (.csv). Accepts file path or base64-encoded content.',
  {
    filePath: z.string().optional().describe('Absolute path to the source file'),
    base64Content: z.string().optional().describe('Base64-encoded file content (use with fileName)'),
    fileName: z.string().optional().describe('File name with extension (required when using base64Content)'),
    outputPath: z.string().optional().describe('Path to save the output PDF. If omitted, returns base64-encoded PDF.'),
    options: z.object({
      pageSize: z.enum(['A4', 'Letter', 'Legal']).optional().describe('Page size (default: A4)'),
      landscape: z.boolean().optional().describe('Landscape orientation (default: false)'),
      margin: z.object({
        top: z.string().optional(),
        right: z.string().optional(),
        bottom: z.string().optional(),
        left: z.string().optional(),
      }).optional().describe('Page margins (e.g., "20mm", "1in")'),
    }).optional().describe('PDF output options'),
  },
  async (params) => {
    try {
      const result = await handleConvertToPdf(params);
      const content: Array<{ type: 'text'; text: string }> = [
        { type: 'text', text: result.text },
      ];
      if (result.base64) {
        content.push({ type: 'text', text: `[BASE64_PDF]\n${result.base64}` });
      }
      return { content };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
);

// --- parse_pdf ---
server.tool(
  'parse_pdf',
  'Extract text content and metadata from a PDF file. Accepts file path or base64-encoded content. Optionally extract specific page ranges.',
  {
    filePath: z.string().optional().describe('Absolute path to the PDF file'),
    base64Content: z.string().optional().describe('Base64-encoded PDF content'),
    fileName: z.string().optional().describe('File name (required when using base64Content)'),
    pageRange: z.object({
      start: z.number().optional().describe('Start page (1-indexed, default: 1)'),
      end: z.number().optional().describe('End page (inclusive, default: last page)'),
    }).optional().describe('Extract text from specific pages only'),
  },
  async (params) => {
    try {
      const result = await handleParsePdf(params);
      return {
        content: [
          { type: 'text' as const, text: result.info },
          { type: 'text' as const, text: `Metadata: ${JSON.stringify(result.metadata, null, 2)}` },
          { type: 'text' as const, text: `--- Extracted Text ---\n${result.text}` },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
);

// --- merge_pdfs ---
server.tool(
  'merge_pdfs',
  'Merge multiple PDF files into a single PDF. Each file can be specified by file path or base64-encoded content.',
  {
    files: z.array(z.object({
      filePath: z.string().optional().describe('Absolute path to a PDF file'),
      base64Content: z.string().optional().describe('Base64-encoded PDF content'),
      fileName: z.string().optional().describe('File name (required when using base64Content)'),
    })).min(2).describe('Array of PDF files to merge (minimum 2)'),
    outputPath: z.string().optional().describe('Path to save the merged PDF. If omitted, returns base64.'),
  },
  async (params) => {
    try {
      const result = await handleMergePdfs(params);
      const content: Array<{ type: 'text'; text: string }> = [
        { type: 'text', text: result.text },
      ];
      if (result.base64) {
        content.push({ type: 'text', text: `[BASE64_PDF]\n${result.base64}` });
      }
      return { content };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
);

// --- pdf_metadata ---
server.tool(
  'pdf_metadata',
  'Get metadata and page information from a PDF file (page count, dimensions, title, author, etc.).',
  {
    filePath: z.string().optional().describe('Absolute path to the PDF file'),
    base64Content: z.string().optional().describe('Base64-encoded PDF content'),
    fileName: z.string().optional().describe('File name (required when using base64Content)'),
  },
  async (params) => {
    try {
      const result = await handlePdfMetadata(params);
      return {
        content: [
          { type: 'text' as const, text: result.info },
          { type: 'text' as const, text: `Metadata:\n${JSON.stringify(result.metadata, null, 2)}` },
          { type: 'text' as const, text: `Pages:\n${JSON.stringify(result.pages, null, 2)}` },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
);

// --- Start server ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP PDF server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  closeBrowser().finally(() => process.exit(1));
});
