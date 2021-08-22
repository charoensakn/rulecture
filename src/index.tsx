import firebase from 'firebase/app';
import 'firebase/auth';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.less';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './i18n';

const firebaseConfig = {
  apiKey: 'AIzaSyCh6thYNpY4-GakAwcMwYrB1EamSw23VHc',
  authDomain: 'ru-submit-status.firebaseapp.com',
  databaseURL: 'https://ru-submit-status-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'ru-submit-status',
  storageBucket: 'ru-submit-status.appspot.com',
  messagingSenderId: '633571507467',
  appId: '1:633571507467:web:152b4e624d0c802be3360e',
};

firebase.initializeApp(firebaseConfig);
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

i18n.use(initReactI18next).init({
  resources,
  lng: 'th',
  interpolation: {
    escapeValue: false,
  },
});

ReactDOM.render(<App />, document.getElementById('root'));
