export interface UploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface UploadRule {
  accept: string[];
  maxBytes: number;
}

const MB = 1024 * 1024;

export const UPLOAD_RULES = {
  image: { accept: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'], maxBytes: 4 * MB },
  video: { accept: ['video/mp4', 'video/webm', 'video/quicktime'], maxBytes: 25 * MB },
  document: {
    accept: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],

    maxBytes: 5 * MB
  },
  /** Advertisement creatives. Static images exclude GIF — that is an animation. */
  adImage: { accept: ['image/png', 'image/jpeg', 'image/webp'], maxBytes: 5 * MB },
  adAnimation: { accept: ['image/gif', 'image/webp'], maxBytes: 8 * MB },
  adVideo: { accept: ['video/mp4', 'video/webm', 'video/quicktime'], maxBytes: 50 * MB }
} satisfies Record<string, UploadRule>;

export type UploadKind = keyof typeof UPLOAD_RULES;

export class UploadError extends Error {
  constructor(
  message: string,
  public reason: 'type' | 'size' | 'name' | 'read' | 'content',
  public limitMb?: number)
  {
    super(message);
    this.name = 'UploadError';
  }
}

const SAFE_NAME = /^[\w\-. ()]+$/;

/** Checks declared type, size and name. Returns the sanitised file name. */
export function validateUpload(file: File, kind: UploadKind): string {
  const rule: UploadRule = UPLOAD_RULES[kind];
  const name = file.name.replace(/[^\w\-. ()]+/g, '_').slice(0, 120);

  if (!rule.accept.includes(file.type)) {
    throw new UploadError(`Unsupported file type: ${file.type || 'unknown'}`, 'type');
  }
  if (file.size === 0) {
    throw new UploadError('The file is empty', 'content');
  }
  if (file.size > rule.maxBytes) {
    throw new UploadError('File is too large', 'size', Math.round(rule.maxBytes / MB));
  }
  if (!SAFE_NAME.test(name)) {
    throw new UploadError('Invalid file name', 'name');
  }
  return name;
}

/**
 * Verifies the file's leading bytes match its declared type, so a renamed
 * executable or HTML file cannot pass as an image or video.
 */
export async function verifyFileSignature(file: File): Promise<void> {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = (from: number, to: number) => String.fromCharCode(...head.slice(from, to));
  const starts = (...bytes: number[]) => bytes.every((b, i) => head[i] === b);

  const ok = (() => {
    switch (file.type) {
      case 'image/jpeg':
        return starts(0xff, 0xd8, 0xff);
      case 'image/png':
        return starts(0x89, 0x50, 0x4e, 0x47);
      case 'image/gif':
        return ascii(0, 4) === 'GIF8';
      case 'image/webp':
        return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
      case 'video/mp4':
      case 'video/quicktime':
        return ascii(4, 8) === 'ftyp' || ascii(4, 8) === 'moov' || ascii(4, 8) === 'mdat';
      case 'video/webm':
        return starts(0x1a, 0x45, 0xdf, 0xa3);
      case 'application/pdf':
        return ascii(0, 4) === '%PDF';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return starts(0x50, 0x4b, 0x03, 0x04);
      case 'application/msword':
        return starts(0xd0, 0xcf, 0x11, 0xe0);
      default:
        return true;
    }
  })();

  if (!ok) throw new UploadError('The file content does not match its type', 'content');
}

/** Validates a picked file against its rule and returns a stored data URL. */
export async function readUpload(file: File, kind: UploadKind): Promise<UploadResult> {
  const name = validateUpload(file, kind);

  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new UploadError('Could not read the file', 'read'));
    reader.readAsDataURL(file);
  });

  return { url, name, size: file.size, type: file.type };
}