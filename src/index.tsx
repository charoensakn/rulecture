import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';
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

(async () => {
  let firebaseConfig;
  try {
    const response = await fetch('/__/firebase/init.json');
    firebaseConfig = await response.json();
    localStorage.set(LASTFIREBASECONFIG_KEY, firebaseConfig);
  } catch {
    firebaseConfig = localStorage.get(LASTFIREBASECONFIG_KEY);
  }
  const app = firebase.initializeApp(firebaseConfig);
  if (window.location.hostname.indexOf('localhost') >= 0) {
    app.auth().useEmulator('http://localhost:9099');
    app.firestore().useEmulator('localhost', 8080);
    app.database().useEmulator('localhost', 9000);
  }
  await app.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  app.auth().languageCode = localStorage.get('lang') || 'th';
  const unsubscribe = await new Promise<firebase.Unsubscribe>((resolve) => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      resolve(unregisterAuthObserver);
    });
  });
  unsubscribe();
  try {
    if (localStorage.get('persistence') && window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[bootstrap] enable firestore persistence');
      await firebase.firestore().enablePersistence();
    }
  } catch (error) {
    console.error('[bootstrap] failed to enable firestore persistence', error);
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: 'th',
    interpolation: {
      escapeValue: false,
    },
  });

  ReactDOM.render(<App />, document.getElementById('root'));
})();
