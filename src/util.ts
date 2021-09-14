import { useLocation } from 'react-router-dom';
import { Material } from './db/MaterialFs';
import { Notification } from './db/NotificationFs';

export const localStorage = {
  set: (key: string, value: any) => {
    if (window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  },
  get: (key: string) => {
    return window.localStorage ? JSON.parse(window.localStorage.getItem(key) || 'null') : null;
  },
  remove: (key: string) => {
    if (window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

export const sessionStorage = {
  set: (key: string, value: any) => {
    if (window.sessionStorage) {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    }
  },
  get: (key: string) => {
    return window.sessionStorage ? JSON.parse(window.sessionStorage.getItem(key) || 'null') : null;
  },
  remove: (key: string) => {
    if (window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
  },
};

export const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export const decodeLocation = (location: string | null) => {
  try {
    if (location && location !== 'null') {
      return decodeURIComponent(escape(window.atob(location)));
    }
  } catch {}
  return '/';
};

export const encodeLocation = (location: { pathname: string; search: string; hash: string }) => {
  const { pathname, search, hash } = location;
  return window.btoa(unescape(encodeURIComponent(`${pathname}${search}${hash}`)));
};

export const mergeString = (s1: string, s2: string, join?: string) => {
  let from = 0;
  for (let i = s1.length - 1; i >= 0 && s1.length - i <= s2.length; i--) {
    if (s1.charAt(i) === s2.charAt(0) && s2.startsWith(s1.substr(i))) {
      from = s1.length - i;
    }
  }
  return s1.concat(join && s1.length > 0 && s2.length > 0 ? join : '', s2.substr(from));
};

const nf0 = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 });
const nf4 = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 4 });

export const numberFormat = (num: number, fraction = 4) => {
  switch (fraction) {
    case 4:
      return nf4.format(num);
    case 2:
      return nf2.format(num);
    case 0:
      return nf0.format(num);
  }
  return new Intl.NumberFormat('th-TH', { maximumFractionDigits: fraction }).format(num);
};

export const flatObject = <T>(o: any): T[] => {
  const list = [];
  for (const key in o) {
    list.push({ ...o[key], key });
  }
  return list;
};

const MATERIAL_TABLE = 'materials';
const NOTIFICATION_TABLE = 'notifications';

export class IndexedDB {
  db: IDBDatabase | null = null;

  static _createObjectStore(db: IDBDatabase, name: string) {
    const objStore = db.createObjectStore(name, { keyPath: 'key' });
    objStore.createIndex(`${name}_key`, 'key', { unique: true });
  }

  async open() {
    this.db = await new Promise<IDBDatabase>((resolve, reject) => {
      if (!window.indexedDB) {
        reject('indexeddb not supported');
      }
      const request = window.indexedDB.open('rulecture-db');
      request.onsuccess = () => {
        const db = request.result;
        resolve(db);
      };
      request.onerror = () => {
        reject(request.error);
      };
      request.onupgradeneeded = () => {
        const db = request.result;
        IndexedDB._createObjectStore(db, MATERIAL_TABLE);
        IndexedDB._createObjectStore(db, NOTIFICATION_TABLE);
      };
    });
  }

  static _store(db: IDBDatabase | null, storeName: string, values: any[]) {
    if (db) {
      const tx = db.transaction(storeName, 'readwrite');
      const o = tx.objectStore(storeName);
      values.forEach((v) => {
        o.add(v);
      });
      tx.commit();
    }
  }

  storeMaterials(materials: (Material & { key: string })[]) {
    IndexedDB._store(this.db, MATERIAL_TABLE, materials);
  }

  storeNotifications(notifications: (Notification & { key: string })[]) {
    IndexedDB._store(this.db, NOTIFICATION_TABLE, notifications);
  }

  static _getAll(db: IDBDatabase | null, storeName: string) {
    return new Promise<any>((resolve) => {
      if (db) {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve([]);
      }
      resolve([]);
    });
  }

  async getMaterials(): Promise<(Material & { key: string })[]> {
    return IndexedDB._getAll(this.db, MATERIAL_TABLE);
  }

  async getNotifications(): Promise<(Notification & { key: string })[]> {
    return IndexedDB._getAll(this.db, NOTIFICATION_TABLE);
  }

  async delete() {
    return new Promise<void>((resolve, reject) => {
      if (!window.indexedDB) {
        reject('indexeddb not supported');
      }
      const request = window.indexedDB.deleteDatabase('rulecture-db');
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }

  clear() {
    if (this.db) {
      const tx = this.db.transaction([MATERIAL_TABLE, NOTIFICATION_TABLE], 'readwrite');
      tx.objectStore(MATERIAL_TABLE).clear();
      tx.objectStore(NOTIFICATION_TABLE).clear();
      tx.commit();
    }
  }
}
