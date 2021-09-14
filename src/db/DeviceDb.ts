import { child, onChildAdded, push, serverTimestamp, set } from 'firebase/database';
import { localStorage } from '../util';
import { Database } from './Database';

const CLIENTID_KEY = 'clientid';

class DeviceDb {
  async clientIdRef() {
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

  async setClientId() {
    const ref = await this.clientIdRef();
    if (ref) {
      return set(ref, {
        dev: window.navigator.userAgent,
        datetime: serverTimestamp(),
      });
    }
  }
}

export const deviceDb = new DeviceDb();
