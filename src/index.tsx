import { initializeApp } from '@firebase/app';
import { browserLocalPersistence, connectAuthEmulator, getAuth, Unsubscribe } from '@firebase/auth';
import { connectDatabaseEmulator, getDatabase } from '@firebase/database';
import { connectFirestoreEmulator, enableIndexedDbPersistence, getFirestore } from '@firebase/firestore';
import { connectStorageEmulator, getStorage } from '@firebase/storage';
import i18n from 'i18next';
import React from 'react';
import ReactDOM from 'react-dom';
import { initReactI18next } from 'react-i18next';
import './ant.less';
import './antdark.less';
import App from './App';
import { switchTheme } from './contexts/setting';
import { DeviceDb } from './db/DeviceDb';
import { RecentLocationDb } from './db/RecentLocationDb';
import { resources } from './i18n';
import './index.less';
import { localStorage } from './util';

const LASTFIREBASECONFIG_KEY = 'lastfirebasecfg';
const APPSERIAL_KEY = 'appserial';
const APPSERIAL = 202109141652;
const TESTHOST = '192.168.0.12';

const initApp = async () => {
  switchTheme(localStorage.get('darkmode'));
  let firebaseConfig;
  try {
    const response = await fetch('/__/firebase/init.json');
    firebaseConfig = await response.json();
    localStorage.set(LASTFIREBASECONFIG_KEY, firebaseConfig);
  } catch {
    firebaseConfig = localStorage.get(LASTFIREBASECONFIG_KEY);
  }
  initializeApp(firebaseConfig);
  const auth = getAuth();
  const firestore = getFirestore();
  const database = getDatabase();
  const storage = getStorage();
  if (window.location.hostname.indexOf('localhost') >= 0 || window.location.hostname.indexOf(TESTHOST) >= 0) {
    connectAuthEmulator(auth, `http://${TESTHOST}:9099`);
    connectFirestoreEmulator(firestore, TESTHOST, 8080);
    connectDatabaseEmulator(database, TESTHOST, 9000);
    connectStorageEmulator(storage, TESTHOST, 9199);
  }
  await auth.setPersistence(browserLocalPersistence);
  auth.languageCode = localStorage.get('lang') || 'th';
  const unsubscribe = await new Promise<Unsubscribe>((resolve) => {
    const unregisterAuthObserver = auth.onAuthStateChanged((user) => {
      if (user) {
        DeviceDb.setClientId();
      }
      resolve(unregisterAuthObserver);
    });
  });
  unsubscribe();
  try {
    if (localStorage.get('persistence') && window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[bootstrap] enable firestore persistence');
      await enableIndexedDbPersistence(firestore);
    }
  } catch (error) {
    console.error('[bootstrap] failed to enable firestore persistence:', error);
  }

  const appSerial = localStorage.get(APPSERIAL_KEY);
  if (typeof appSerial !== 'number' || appSerial < APPSERIAL) {
    console.log('[bootstrap] cleaning data');
    await DeviceDb.clear();
    await RecentLocationDb.clear();
    localStorage.set(APPSERIAL_KEY, APPSERIAL);
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: localStorage.get('lang') || 'th',
    interpolation: {
      escapeValue: false,
    },
  });
  ReactDOM.render(<App />, document.getElementById('root'));
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    let registered = false;
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      registered = true;
      console.log('[bootstrap] sw registered');
      registration.onupdatefound = (ev) => {
        console.log('[bootstrap] sw found update');
        const installer = registration.installing;
        if (installer) {
          installer.onstatechange = () => {
            console.log('[bootstrap] sw updated');
          };
          installer.onerror = (error) => {
            console.error('[bootstrap] sw update error:', error);
          };
        }
        registration.update();
      };
    } catch (error) {
      console.error('[bootstrap] sw error:', error);
    } finally {
      if (registered) {
        navigator.serviceWorker.ready.then(() => {
          console.log('[bootstrap] init app with service worker');
          initApp();
        });
      } else {
        console.log('[bootstrap] init app without service worker');
        initApp();
      }
    }
  });
}
