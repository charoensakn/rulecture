import { doc, getDoc } from '@firebase/firestore';
import { flatObject } from '../util';
import { Firestore } from './Firestore';

export type Notification = {
  notiEn: string;
  notiTh: string;
  timestamp: number;
};

export class NotificationFs {
  static async getAll(): Promise<(Notification & { key: string })[]> {
    const snapshot = await getDoc(doc(Firestore.notificationCollection()));
    if (snapshot.exists()) {
      return flatObject<Notification & { key: string }>(snapshot.data());
    }
    return [];
  }

  static async get(key: string) {
    const snapshot = await getDoc(doc(Firestore.notificationCollection(), key));
    if (snapshot.exists()) {
      return snapshot.data() as Notification;
    }
    return null;
  }
}
