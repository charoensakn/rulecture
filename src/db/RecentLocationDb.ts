import { get, onValue, remove, serverTimestamp, set } from '@firebase/database';
import { Database } from './Database';

export type Location = { name: string; url: string; timestamp: number };

export class RecentLocationDb {
  static async push(name: string, url: string) {
    const ref = Database.recentLocationsRef();
    if (ref) {
      console.log('[db] push recent location:', url);
      const urls = [{ name, url, timestamp: serverTimestamp() }];
      const snapshot = await get(ref);
      if (snapshot.exists()) {
        let count = 0;
        for (const val of snapshot.val()) {
          if (val.name && val.url && val.url !== url) {
            urls.push({ name: val.name, url: val.url, timestamp: val.timestamp });
          }
          if (++count >= 14) break;
        }
      }
      await set(ref, urls);
      return true;
    }
    return false;
  }

  static onValue(fn: (value: Location[]) => void, onlyOnce = false) {
    const ref = Database.recentLocationsRef();
    if (ref) {
      return onValue(
        ref,
        (snapshot) => {
          if (snapshot.exists()) {
            fn(snapshot.val() || []);
          }
        },
        { onlyOnce }
      );
    }
    return null;
  }

  static async clear() {
    const ref = Database.recentLocationsRef();
    if (ref) {
      await remove(ref);
    }
  }
}
