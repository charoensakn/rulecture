import { child, get, set } from '@firebase/database';
import { localStorage } from '../util';
import { Database } from './Database';

const MATERIALSERIAL_KEY = 'matserial';
const NOTIFICATIONSERIAL_KEY = 'notiserial';

export type Serial = {
  materials: number;
  notifications: number;
};

export class SerialDb {
  static async get(): Promise<Serial | null> {
    const snapshot = await get(Database.serialsRef());
    if (snapshot.exists()) {
      const serials = snapshot.val();
      return {
        materials: serials.materials || 0,
        notifications: serials.notifications || 0,
      };
    }
    return null;
  }

  static async setMaterials(serial: number) {
    const ref = child(Database.serialsRef(), 'materials');
    await set(ref, serial);
  }

  static async setNotifications(serial: number) {
    const ref = child(Database.serialsRef(), 'notifications');
    await set(ref, serial);
  }

  static async findUpdate(): Promise<Serial> {
    const materialSerial = localStorage.get(MATERIALSERIAL_KEY) || 0;
    const notificationSerial = localStorage.get(NOTIFICATIONSERIAL_KEY) || 0;
    const serials = await SerialDb.get();
    return serials
      ? { materials: serials.materials - materialSerial, notifications: serials.notifications - notificationSerial }
      : {
          materials: 0,
          notifications: 0,
        };
  }

  static incrementLocalMaterial(serial: number) {
    localStorage.set(MATERIALSERIAL_KEY, (localStorage.get(MATERIALSERIAL_KEY) || 0) + serial);
  }

  static incrementLocalNotification(serial: number) {
    localStorage.set(NOTIFICATIONSERIAL_KEY, (localStorage.get(NOTIFICATIONSERIAL_KEY) || 0) + serial);
  }
}
