import { ConfigProvider } from 'antd';
import firebase from 'firebase/app';
import 'firebase/auth';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import './App.less';
import { ScrollToTop } from './components/ScrollToTop';
import {
  Auth,
  AuthContext,
  ChangeAutoHideFn,
  ChangeAutoHideSensitivityFn,
  ChangeDarkModeFn,
  ChangeLanguageFn,
  ChangeRoundingFn,
  LoginFn,
  LogoutFn,
  Setting,
  SettingContext,
} from './ctx';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingPage } from './pages/SettingPage';
import { SignedInPage } from './pages/SignedInPage';
import { encodeLocation, localStorage } from './util';
import enUS from 'antd/lib/locale/en_US';
import thTH from 'antd/lib/locale/th_TH';
import i18n from 'i18next';
import { LineReportPage } from './pages/LineReportPage';

const LASTLOGIN_KEY = 'lastlogin';
const BODY = document.getElementsByTagName('body')[0];

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

function getAuth(user?: firebase.User | null) {
  if (user === undefined) {
    const auth = localStorage.get(LASTLOGIN_KEY);
    if (auth && auth.uid) {
      return auth as Auth;
    }
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
  console.log('[app] uid:', auth.uid);

  const login: LoginFn = useCallback((user) => {
    const a = getAuth(user);
    setAuth(a);
    localStorage.set(LASTLOGIN_KEY, a);
  }, []);

  const logout: LogoutFn = useCallback(async () => {
    localStorage.remove(LASTLOGIN_KEY);
    return firebase
      .auth()
      .signOut()
      .then(() => {
        setAuth({});
      });
  }, []);

  const [language, setLanguage] = useState(localStorage.get('lang') || 'th');
  const [rounding, setRounding] = useState(localStorage.get('rounding') || 0);
  const [darkMode, setDarkMode] = useState(localStorage.get('darkmode') || false);
  const [autoHide, setAutoHide] = useState(localStorage.get('autohide') || true);
  const [autoHideSensitivity, setAutoHideSensitivity] = useState(localStorage.get('autohidesense') || 2);

  useEffect(() => {
    localStorage.set('lang', language);
    localStorage.set('rounding', rounding);
    localStorage.set('darkmode', darkMode);
    localStorage.set('autohide', autoHide);
    localStorage.set('autohidesense', autoHideSensitivity);

    if (BODY) {
      BODY.style.backgroundColor = darkMode ? 'rgb(0,0,0)' : 'rgb(240,242,245)';
    }

    i18n.changeLanguage(language);
  });

  const setting: Setting = {
    language,
    rounding,
    darkMode,
    autoHide,
    autoHideSensitivity,
  };

  const changeLanguage: ChangeLanguageFn = (value) => {
    setLanguage(value);
    localStorage.set('lang', value);
    i18n.changeLanguage(value);
  };
  const changeRounding: ChangeRoundingFn = (value) => {
    setRounding(value);
    localStorage.set('rounding', value);
  };
  const changeDarkMode: ChangeDarkModeFn = (value) => {
    setDarkMode(value);
    localStorage.set('darkmode', value);
    if (BODY) {
      BODY.style.backgroundColor = value ? 'rgb(0,0,0)' : 'rgb(240,242,245)';
    }
  };
  const changeAutoHide: ChangeAutoHideFn = (value) => {
    setAutoHide(value);
    localStorage.set('autohide', value);
  };
  const changeAutoHideSensitivity: ChangeAutoHideSensitivityFn = (value) => {
    setAutoHideSensitivity(value);
    localStorage.set('autohidesense', value);
  };

  return (
    <SettingContext.Provider
      value={{ setting, changeLanguage, changeRounding, changeDarkMode, changeAutoHide, changeAutoHideSensitivity }}
    >
      <SettingContext.Consumer>
        {({ setting }) => (
          <ConfigProvider
            locale={setting.language === 'en' ? enUS : thTH}
            prefixCls={setting.darkMode ? 'antdark' : 'ant'}
          >
            <AuthContext.Provider value={{ auth, login, logout }}>
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
                    <Route path='/apps/linereport/:subject'>
                      <LineReportPage />
                    </Route>
                    <PrivateRoute path='/signed-in'>
                      <SignedInPage />
                    </PrivateRoute>
                    <PrivateRoute path='/setting'>
                      <SettingPage />
                    </PrivateRoute>
                    <PrivateRoute path='/profile'>
                      <ProfilePage />
                    </PrivateRoute>
                    <PrivateRoute exact path='/'>
                      <HomePage />
                    </PrivateRoute>
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
