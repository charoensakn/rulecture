import { child, onChildAdded, onValue, push, remove, serverTimestamp, set } from '@firebase/database';
import { flatObject, localStorage } from '../util';
import { Database } from './Database';

const CLIENTID_KEY = 'clientid';

export type Device = { key: string; dev: string; timestamp: number };

export class DeviceDb {
  static async _clientIdRef() {
    const id = localStorage.get(CLIENTID_KEY);
    const ref = Database.devicesRef();
    if (ref) {
      onChildAdded(
        ref,
        (snapshot) => {
          localStorage.set(CLIENTID_KEY, snapshot.key);
        },
        { onlyOnce: true }
      );
      return id ? child(ref, id) : push(ref);
    }
    return null;
  }

  static async setClientId() {
    const ref = await this._clientIdRef();
    if (ref) {
      return set(ref, {
        dev: window.navigator.userAgent,
        timestamp: serverTimestamp(),
      });
    }
  }

  static onValue(fn: (value: Device[]) => void, onlyOnce = false) {
    console.log(1);
    const ref = Database.devicesRef();
    if (ref) {
      console.log(2);
      return onValue(
        ref,
        (snapshot) => {
          if (snapshot.exists()) {
            console.log(3);
            const val = flatObject<Device>(snapshot.val()).sort((a, b) => b.timestamp - a.timestamp);
            console.log(val);
            fn(val);
          }
        },
        { onlyOnce }
      );
    }
    return null;
  }

  static async clear() {
    const ref = Database.devicesRef();
    if (ref) {
      await remove(ref);
      localStorage.remove(CLIENTID_KEY);
    }
  }
}
