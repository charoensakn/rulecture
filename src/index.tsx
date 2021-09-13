import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';
import 'firebase/storage';
import i18n from 'i18next';
import React from 'react';
import ReactDOM from 'react-dom';
import { initReactI18next } from 'react-i18next';
import './ant.less';
import './antdark.less';
import App from './App';
import { resources } from './i18n';
import './index.less';
import { localStorage } from './util';

const LASTFIREBASECONFIG_KEY = 'lastfirebasecfg';
const CLIENTID_KEY = 'clientid';
const TESTHOST = '192.168.0.12';

const initApp = async () => {
  let firebaseConfig;
  try {
    const response = await fetch('/__/firebase/init.json');
    firebaseConfig = await response.json();
    localStorage.set(LASTFIREBASECONFIG_KEY, firebaseConfig);
  } catch {
    firebaseConfig = localStorage.get(LASTFIREBASECONFIG_KEY);
  }
  const app = firebase.initializeApp(firebaseConfig);
  if (window.location.hostname.indexOf('localhost') >= 0 || window.location.hostname.indexOf(TESTHOST) >= 0) {
    app.auth().useEmulator(`http://${TESTHOST}:9099`);
    app.firestore().useEmulator(TESTHOST, 8080);
    app.database().useEmulator(TESTHOST, 9000);
    app.storage().useEmulator(TESTHOST, 9199);
  }
  await app.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  app.auth().languageCode = localStorage.get('lang') || 'th';
  const unsubscribe = await new Promise<firebase.Unsubscribe>((resolve) => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      resolve(unregisterAuthObserver);
      if (user && user.uid) {
        const db = app.database().ref(`/users/${user.uid}/devices`);
        db.on('child_added', (data) => {
          localStorage.set(CLIENTID_KEY, data.key);
        });
        const clientId = localStorage.get(CLIENTID_KEY);
        const deviceRef = clientId ? db.child(clientId) : db.push();
        deviceRef.set({
          dev: window.navigator.userAgent,
          datetime: firebase.database.ServerValue.TIMESTAMP,
        });
      }
    });
  });
  unsubscribe();
  try {
    if (localStorage.get('persistence') && window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[firebase] enable firestore persistence');
      await firebase.firestore().enablePersistence();
    }
  } catch (error) {
    console.error('[firebase] failed to enable firestore persistence:', error);
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: 'th',
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
      console.log('[sw] registered');
      registration.onupdatefound = (ev) => {
        console.log('[sw] found update');
        const installer = registration.installing;
        if (installer) {
          installer.onstatechange = () => {
            console.log('[sw] updated');
          };
          installer.onerror = (error) => {
            console.log('[sw] update error', error);
          };
        }
        registration.update();
      };
    } catch (error) {
      console.error('[sw] error:', error);
    } finally {
      if (registered) {
        navigator.serviceWorker.ready.then(() => {
          console.log('[sw] init app with service worker');
          initApp();
        });
      } else {
        console.log('[sw] init app without service worker');
        initApp();
      }
    }
  });
}
