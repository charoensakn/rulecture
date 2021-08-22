import firebase from 'firebase/app';
import 'firebase/auth';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.less';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './i18n';

(async () => {
  const firebaseConfig = await fetch('/__/firebase/init.json');
  firebase.initializeApp(await firebaseConfig.json());
  if (window.location.hostname.indexOf('localhost') >= 0) {
    firebase.auth().useEmulator('http://localhost:9099');
  } else {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(() => console.log('[global] SW registered.'))
          .catch(() => console.log('[global] SW registration failed.'));
      });
    }
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
