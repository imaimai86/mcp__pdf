export interface ResolvedInput {
  buffer: Buffer;
  fileName: string;
  extension: string;
}

export interface ConvertOptions {
  pageSize?: 'A4' | 'Letter' | 'Legal';
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

export type Converter = (input: ResolvedInput, options?: ConvertOptions) => Promise<Buffer>;
