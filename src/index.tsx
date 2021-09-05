import firebase from 'firebase/app';
import 'firebase/auth';
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
  firebase.initializeApp(firebaseConfig);
  if (window.location.hostname.indexOf('localhost') >= 0) {
    firebase.auth().useEmulator('http://localhost:9099');
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
