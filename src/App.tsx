import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import thTH from 'antd/lib/locale/th_TH';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import i18n from 'i18next';
import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import './App.less';
import { ScrollToTop } from './components/ScrollToTop';
import {
  Auth,
  AuthContext,
  ChangeBooleanFn,
  ChangeNumberFn,
  ChangeStringFn,
  LoginFn,
  LogoutFn,
  PushRecentLocationFn,
  Setting,
  SettingContext,
} from './ctx';
import { GradingPage } from './pages/grading/GradingPage';
import { HomePage } from './pages/HomePage';
import { LineReportPage } from './pages/LineReportPage';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingPage } from './pages/SettingPage';
import { SignedInPage } from './pages/SignedInPage';
import { encodeLocation, localStorage } from './util';

const LASTLOGIN_KEY = 'lastlogin';
const LANG_KEY = 'lang';
const ROUNDING_KEY = 'rounding';
const DARKMODE_KEY = 'darkmode';
const AUTOHIDE_KEY = 'autohide';
const AUTOHIDESENSE_KEY = 'autohidesense';
const PERSISTENCE_KEY = 'persistence';
const DARKMODEFAST_KEY = 'darkmodefast';
const LANGUAGEFAST_KEY = 'languagefast';

const BODY = document.querySelector('body');
const THEMECOLOR = document.querySelector('meta[name="theme-color"]');

function PrivateRoute({ exact, path, children }: React.PropsWithChildren<{ exact?: boolean; path: string }>) {
  const { auth } = useContext(AuthContext);
  return (
    <Route
      path={path}
      render={({ location }) =>
        auth.uid ? (
          children
        ) : (
          <Redirect exact={exact} to={{ pathname: '/login', search: `redirect=${encodeLocation(location)}` }} />
        )
      }
    />
  );
}

function getAuth(user?: firebase.User): Auth {
  if (user === undefined) {
    const auth = localStorage.get(LASTLOGIN_KEY);
    const u = firebase.auth().currentUser;
    return { ...auth, uid: u ? u.uid : null };
  }

  if (!user || !user.uid) {
    return { uid: undefined };
  }
  const matches = user.email?.match(/^(\d{10})@rumail\.ru\.ac\.th$/);
  const studentId = matches ? matches[1] : undefined;
  return {
    uid: user.uid,
    email: user.email || undefined,
    emailVerified: user.emailVerified,
    studentId,
    displayName: user.displayName || undefined,
    photoURL: user.photoURL || undefined,
    phoneNumber: user.phoneNumber || undefined,
  };
}

function App() {
  const [auth, setAuth] = useState<Auth>(getAuth());
  const [language, setLanguage] = useState(localStorage.get(LANG_KEY) || 'th');
  const [rounding, setRounding] = useState(localStorage.get(ROUNDING_KEY) || 0);
  const [darkMode, setDarkMode] = useState(localStorage.get(DARKMODE_KEY) || false);
  const [autoHide, setAutoHide] = useState(localStorage.get(AUTOHIDE_KEY) || true);
  const [persistence, setPersistence] = useState(localStorage.get(PERSISTENCE_KEY) || false);
  const [autoHideSensitivity, setAutoHideSensitivity] = useState(localStorage.get(AUTOHIDESENSE_KEY) || 10);
  const [darkModeFastSwitch, setDarkModeFastSwitch] = useState(localStorage.get(DARKMODEFAST_KEY) || false);
  const [languageFastSwitch, setLanguageFastSwitch] = useState(localStorage.get(LANGUAGEFAST_KEY) || false);

  const login: LoginFn = (user) => {
    const a = getAuth(user);
    setAuth(a);
    localStorage.set(LASTLOGIN_KEY, a);
  };

  const logout: LogoutFn = async () => {
    localStorage.remove(LASTLOGIN_KEY);
    return firebase
      .auth()
      .signOut()
      .then(() => setAuth({}));
  };

  const pushRecentLocation: PushRecentLocationFn = async (name: string, url: string) => {
    if (auth.uid) {
      console.log('[app] push recent location:', url);
      const urls = [{ name, url, datetime: firebase.database.ServerValue.TIMESTAMP }];
      const db = firebase.database().ref(`users/${auth.uid}/recentLocations`);
      const snapshot = await db.get();
      if (snapshot.exists()) {
        let count = 0;
        for (const val of snapshot.val()) {
          if (val.name && val.url && val.url !== url) {
            urls.push({ name: val.name, url: val.url, datetime: val.datetime });
          }
          if (++count >= 14) break;
        }
      }
      await db.set(urls);
    }
  };

  const switchTheme = (dark?: boolean) => {
    if (BODY) {
      BODY.style.backgroundColor = dark ? 'rgb(0,0,0)' : 'rgb(240,242,245)';
    }
    if (THEMECOLOR) {
      THEMECOLOR.setAttribute('content', dark ? '#000' : '#1890ff');
    }
    ConfigProvider.config({
      prefixCls: dark ? 'antdark' : 'ant',
    });
  };

  useEffect(() => {
    localStorage.set(LANG_KEY, language);
    localStorage.set(ROUNDING_KEY, rounding);
    localStorage.set(DARKMODE_KEY, darkMode);
    localStorage.set(AUTOHIDE_KEY, autoHide);
    localStorage.set(AUTOHIDESENSE_KEY, autoHideSensitivity);
    localStorage.set(PERSISTENCE_KEY, persistence);
    localStorage.set(DARKMODEFAST_KEY, darkModeFastSwitch);
    localStorage.set(LANGUAGEFAST_KEY, languageFastSwitch);

    switchTheme(darkMode);

    i18n.changeLanguage(language);

    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      console.log('[app] auth uid:', user?.uid);
      if (user) {
        login(user);
      }
    });
    return () => unregisterAuthObserver();
  }, [darkMode, language]);

  const setting: Setting = {
    language,
    rounding,
    darkMode,
    autoHide,
    autoHideSensitivity,
    persistence,
    darkModeFastSwitch,
    languageFastSwitch,
  };

  const changeLanguage: ChangeStringFn = (value) => {
    setLanguage(value);
    localStorage.set(LANG_KEY, value);
    i18n.changeLanguage(value);
  };
  const changeRounding: ChangeNumberFn = (value) => {
    setRounding(value);
    localStorage.set(ROUNDING_KEY, value);
  };
  const changeDarkMode: ChangeBooleanFn = (value) => {
    setDarkMode(value);
    switchTheme(value);
    localStorage.set(DARKMODE_KEY, value);
  };
  const changeAutoHide: ChangeBooleanFn = (value) => {
    setAutoHide(value);
    localStorage.set(AUTOHIDE_KEY, value);
  };
  const changeAutoHideSensitivity: ChangeNumberFn = (value) => {
    setAutoHideSensitivity(value);
    localStorage.set(AUTOHIDESENSE_KEY, value);
  };
  const changePersistence: ChangeBooleanFn = (value) => {
    setPersistence(value);
    localStorage.set(PERSISTENCE_KEY, value);
  };
  const changeDarkModeFastSwitch: ChangeBooleanFn = (value) => {
    setDarkModeFastSwitch(value);
    localStorage.set(DARKMODEFAST_KEY, value);
  };
  const changeLanguageFastSwitch: ChangeBooleanFn = (value) => {
    setLanguageFastSwitch(value);
    localStorage.set(LANGUAGEFAST_KEY, value);
  };

  return (
    <SettingContext.Provider
      value={{
        setting,
        changeLanguage,
        changeRounding,
        changeDarkMode,
        changeAutoHide,
        changeAutoHideSensitivity,
        changePersistence,
        changeDarkModeFastSwitch,
        changeLanguageFastSwitch,
      }}>
      <SettingContext.Consumer>
        {({ setting }) => (
          <ConfigProvider
            locale={setting.language === 'en' ? enUS : thTH}
            prefixCls={setting.darkMode ? 'antdark' : 'ant'}>
            <AuthContext.Provider value={{ auth, login, logout, pushRecentLocation }}>
              <div className='App'>
                <Router>
                  <ScrollToTop />
                  <Switch>
                    <Route path='/login'>
                      <LoginPage />
                    </Route>
                    <Route path='/logout'>
                      <LogoutPage />
                    </Route>
                    <Route path='/apps/grading'>
                      <GradingPage />
                    </Route>
                    <Route path='/apps/linereport/:subject'>
                      <LineReportPage />
                    </Route>
                    <Route path='/setting'>
                      <SettingPage />
                    </Route>
                    <PrivateRoute path='/signed-in'>
                      <SignedInPage />
                    </PrivateRoute>
                    <PrivateRoute path='/profile'>
                      <ProfilePage />
                    </PrivateRoute>
                    <Route exact path='/'>
                      <HomePage />
                    </Route>
                    <Route path='*'>
                      <NotFoundPage />
                    </Route>
                  </Switch>
                </Router>
              </div>
            </AuthContext.Provider>
          </ConfigProvider>
        )}
      </SettingContext.Consumer>
    </SettingContext.Provider>
  );
}

export default App;
