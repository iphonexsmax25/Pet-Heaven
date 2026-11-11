// Pet images are stored in IndexedDB (not localStorage). A pet record keeps only the image ID.
// Everything stays in this browser: there is no backend.
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20 MB
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const IMAGE_TOO_LARGE_MESSAGE = 'The image is too large (maximum 20 MB).';
export const IMAGE_TYPE_MESSAGE = 'Please choose a JPG, PNG or WebP image.';

const DB_NAME = 'petheaven_images_db';
const STORE = 'images';

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open image storage.'));
    request.onblocked = () => reject(new Error('Image storage is blocked.'));
  }).catch((error) => {
    dbPromise = null; // allow a later retry
    throw error;
  });
  return dbPromise;
}

const run = (mode, action) =>
  openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(request ? request.result : undefined);
    tx.onerror = () => reject(tx.error || new Error('Image storage failed.'));
    tx.onabort = () => reject(tx.error || new Error('Image storage was cancelled.'));
  }));

const makeImageId = () => `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// Checks type and size. Returns an error message, or '' when the file is fine.
export function validateImageFile(file) {
  if (!file) return '';
  if (!IMAGE_TYPES.includes(file.type)) return IMAGE_TYPE_MESSAGE;
  if (file.size > MAX_IMAGE_BYTES) return IMAGE_TOO_LARGE_MESSAGE;
  return '';
}

// Saves a file (Blob) and returns its new image ID
export async function saveImage(file) {
  const id = makeImageId();
  await run('readwrite', (store) => store.put({ id, blob: file, type: file.type, savedAt: new Date().toISOString() }));
  return id;
}

// Returns the saved Blob, or null when there is no image with that ID
export async function getImage(id) {
  if (!id) return null;
  const record = await run('readonly', (store) => store.get(id));
  return record && record.blob ? record.blob : null;
}

// Only used to clean up an image whose pet could not be saved
export async function deleteImage(id) {
  if (!id) return;
  await run('readwrite', (store) => store.delete(id));
}
