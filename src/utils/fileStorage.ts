/**
 * Robust IndexedDB client storage for textbooks and educational documents
 * Handles PDF, DOCX, EPUB files of multiple megabytes without exceeding localStorage limits.
 */

const DB_NAME = 'thcs_myhoa_storage';
const DB_VERSION = 1;
const STORE_NAME = 'textbook_files';

export interface StoredFileRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  savedAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveTextbookFile(record: StoredFileRecord): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallback to memory/localStorage if IndexedDB fails:', err);
    try {
      // Only small fallback in localStorage if possible
      if (record.dataUrl.length < 2 * 1024 * 1024) {
        localStorage.setItem(`thcs_file_${record.id}`, JSON.stringify(record));
      }
    } catch {}
  }
}

export async function getTextbookFile(id: string): Promise<StoredFileRecord | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    try {
      const saved = localStorage.getItem(`thcs_file_${id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  }
}

export async function deleteTextbookFile(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      localStorage.removeItem(`thcs_file_${id}`);
    } catch {}
  }
}

/**
 * Triggers a download of a dataUrl with a specified file name
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
