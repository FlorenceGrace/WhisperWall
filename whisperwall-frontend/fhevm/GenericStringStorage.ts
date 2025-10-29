export interface GenericStringStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createInMemoryStringStorage(): GenericStringStorage {
  const store = new Map<string, string>();

  return {
    getItem(key: string): string | null {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      store.set(key, value);
    },
    removeItem(key: string): void {
      store.delete(key);
    },
  };
}

export function createLocalStringStorage(): GenericStringStorage {
  if (typeof window === "undefined" || !window.localStorage) {
    console.warn("localStorage not available, using in-memory storage");
    return createInMemoryStringStorage();
  }

  return {
    getItem(key: string): string | null {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.error("localStorage.getItem error:", e);
        return null;
      }
    },
    setItem(key: string, value: string): void {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        console.error("localStorage.setItem error:", e);
      }
    },
    removeItem(key: string): void {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        console.error("localStorage.removeItem error:", e);
      }
    },
  };
}


