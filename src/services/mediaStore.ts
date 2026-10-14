/**
 * Binary media store backed by IndexedDB.
 *
 * Advertisement images and videos are far too large for localStorage, so the
 * database only stores a `media:<id>` reference and the file itself lives here.
 */

const DB_NAME = 'rwandaconnect.media';
const STORE = 'files';
export const MEDIA_PREFIX = 'media:';

interface StoredFile {
  id: string;
  blob: Blob;
  name: string;
  type: string;
  size: number;
  createdAt: string;
}

let opening: Promise<IDBDatabase> | null = null;
const objectUrls = new Map<string, string>();

function open(): Promise<IDBDatabase> {
  if (opening) return opening;
  opening = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser does not support file storage.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open file storage.'));
  });
  opening.catch(() => {
    opening = null;
  });
  return opening;
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (idb) =>
    new Promise<T>((resolve, reject) => {
      const tx = idb.transaction(STORE, mode);
      const request = fn(tx.objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('File storage request failed.'));
    })
  );
}

export function isStoredMedia(ref: string | undefined): ref is string {
  return !!ref && ref.startsWith(MEDIA_PREFIX);
}

function newId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function putMedia(file: Blob, name: string): Promise<string> {
  const record: StoredFile = {
    id: newId(),
    blob: file,
    name,
    type: file.type,
    size: file.size,
    createdAt: new Date().toISOString()
  };
  await run('readwrite', (store) => store.put(record));
  return `${MEDIA_PREFIX}${record.id}`;
}

/** Resolves a reference to a displayable URL; plain https URLs pass through. */
export async function resolveMediaUrl(ref: string): Promise<string | null> {
  if (!isStoredMedia(ref)) return ref;
  const cached = objectUrls.get(ref);
  if (cached) return cached;
  const record = await run<StoredFile | undefined>('readonly', (store) =>
  store.get(ref.slice(MEDIA_PREFIX.length))
  );
  if (!record) return null;
  const url = URL.createObjectURL(record.blob);
  objectUrls.set(ref, url);
  return url;
}

export async function deleteMedia(ref: string): Promise<void> {
  if (!isStoredMedia(ref)) return;
  const cached = objectUrls.get(ref);
  if (cached) {
    URL.revokeObjectURL(cached);
    objectUrls.delete(ref);
  }
  await run('readwrite', (store) => store.delete(ref.slice(MEDIA_PREFIX.length)));
}