import { get, serverTimestamp, set } from 'firebase/database';
import { Database } from './Database';

class RecentLocationDb {
  async push(name: string, url: string) {
    const ref = Database.recentLocationsRef();
    if (ref) {
      console.log('[db] push recent location:', url);
      const urls = [{ name, url, datetime: serverTimestamp() }];
      const snapshot = await get(ref);
      if (snapshot.exists()) {
        let count = 0;
        for (const val of snapshot.val()) {
          if (val.name && val.url && val.url !== url) {
            urls.push({ name: val.name, url: val.url, datetime: val.datetime });
          }
          if (++count >= 14) break;
        }
      }
      await set(ref, urls);
      return true;
    }
    return false;
  }
}

export const recentLocationDb = new RecentLocationDb();
