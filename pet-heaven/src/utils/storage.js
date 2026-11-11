// Safe helpers for localStorage. They never throw, so the app
// will not crash if storage is blocked or contains broken data.
export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

// Add one item to a saved list (used for applications, messages, etc.)
export function appendToList(key, item) {
  const list = readStorage(key, []);
  const updated = Array.isArray(list) ? [...list, item] : [item];
  return writeStorage(key, updated);
}

// One-time move of data saved under the old "Paw3 Heaven" keys to the new "Pet Heaven" keys,
// so existing accounts, pets, favourites and applications are not lost after the rename.
export function migrateLegacyStorage() {
  try {
    const store = window.localStorage;
    store.removeItem('petheaven_quiz'); // saved data of the removed readiness quiz
    const oldKeys = [];
    for (let i = 0; i < store.length; i += 1) {
      const key = store.key(i);
      if (key && (key === 'paw3heaven_pets' || key.startsWith('paw3_'))) oldKeys.push(key);
    }
    oldKeys.forEach((key) => {
      try {
        const newKey = key === 'paw3heaven_pets' ? 'petheaven_pets' : `petheaven_${key.slice(5)}`;
        if (store.getItem(newKey) === null) store.setItem(newKey, store.getItem(key));
        store.removeItem(key);
      } catch (error) {
        /* ignore this key and keep going */
      }
    });
  } catch (error) {
    /* storage is blocked: nothing to move */
  }
}
