import { getAuth } from '@firebase/auth';
import { doc, getDoc } from '@firebase/firestore';
import { Firestore } from './Firestore';

export class GroupFs {
  static async isMember(group: string) {
    const snapshot = await getDoc(doc(Firestore.groupCollection(), group));
    if (snapshot.exists()) {
      const users = snapshot.get('users');
      return Array.isArray(users) && users.indexOf(getAuth().currentUser?.uid) >= 0;
    }
    return false;
  }

  static async isAdmin() {
    return this.isMember('admin');
  }

  static async getAllGroups() {
    const snapshot = await getDoc(doc(Firestore.groupCollection()));
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  }
}
