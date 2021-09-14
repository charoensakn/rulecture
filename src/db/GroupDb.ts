import { get } from '@firebase/database';
import { Database } from './Database';

export class GroupDb {
  async get(): Promise<string[]> {
    const ref = Database.groupsRef();
    if (ref) {
      const snapshot = await get(ref);
      if (snapshot.exists()) {
        return snapshot.val() || [];
      }
    }
    return [];
  }
}
