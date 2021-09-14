import { getAuth } from '@firebase/auth';
import { getDatabase, ref, child } from '@firebase/database';

export class Database {
  static usersRef() {
    const user = getAuth().currentUser;
    return user ? ref(getDatabase(), `/users/${user.uid}`) : null;
  }

  static recentLocationsRef() {
    const userRef = Database.usersRef();
    return userRef ? child(userRef, 'recentLocations') : null;
  }

  static devicesRef() {
    const userRef = Database.usersRef();
    return userRef ? child(userRef, 'devices') : null;
  }

  static groupsRef() {
    const userRef = Database.usersRef();
    return userRef ? child(userRef, 'groups') : null;
  }

  static notificationsRef() {
    const userRef = Database.usersRef();
    return userRef ? child(userRef, 'notification') : null;
  }

  static serialsRef() {
    return ref(getDatabase(), `/serials`);
  }
}
