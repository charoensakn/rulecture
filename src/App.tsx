import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import thTH from 'antd/lib/locale/th_TH';
import { getAuth } from 'firebase/auth';
import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import './App.less';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthContext, ChangeAuthUserFn, getAuthUser } from './contexts/auth';
import { ChangeBooleanFn, ChangeNumberFn, ChangeStringFn, SettingContext } from './contexts/setting';
import { route } from './route';
import { encodeLocation } from './util';

function App() {
  const defaultAuthContext = useContext(AuthContext);
  const defaultSettingContext = useContext(SettingContext);

  const [authUser, setAuthUser] = useState(defaultAuthContext.authUser);
  const changeAuthUser: ChangeAuthUserFn = (authUser) => {
    setAuthUser(authUser);
    defaultAuthContext.changeAuthUser(authUser);
  };

  const [setting, setSetting] = useState(defaultSettingContext.setting);
  const changeLanguage: ChangeStringFn = (language) => {
    setSetting({ ...setting, language });
    defaultSettingContext.changeLanguage(language);
  };
  const changeRounding: ChangeNumberFn = (rounding) => {
    setSetting({ ...setting, rounding });
    defaultSettingContext.changeRounding(rounding);
  };
  const changeDarkMode: ChangeBooleanFn = (darkMode) => {
    setSetting({ ...setting, darkMode });
    defaultSettingContext.changeDarkMode(darkMode);
  };
  const changeAutoHide: ChangeBooleanFn = (autoHide) => {
    setSetting({ ...setting, autoHide });
    defaultSettingContext.changeAutoHide(autoHide);
  };
  const changeAutoHideSensitivity: ChangeNumberFn = (autoHideSensitivity) => {
    setSetting({ ...setting, autoHideSensitivity });
    defaultSettingContext.changeAutoHideSensitivity(autoHideSensitivity);
  };
  const changePersistence: ChangeBooleanFn = (persistence) => {
    setSetting({ ...setting, persistence });
    defaultSettingContext.changePersistence(persistence);
  };
  const changeLanguageFastSwitch: ChangeBooleanFn = (languageFastSwitch) => {
    setSetting({ ...setting, languageFastSwitch });
    defaultSettingContext.changeLanguageFastSwitch(languageFastSwitch);
  };
  const changeDarkModeFastSwitch: ChangeBooleanFn = (darkModeFastSwitch) => {
    setSetting({ ...setting, darkModeFastSwitch });
    defaultSettingContext.changeDarkModeFastSwitch(darkModeFastSwitch);
  };

  useEffect(() => {
    const unregisterAuthObserver = getAuth().onAuthStateChanged((user) => {
      const a = getAuthUser(user);
      console.log('[app] auth uid:', a.uid);
      if (a.uid !== authUser.uid) {
        changeAuthUser(a);
      }
    });
    return () => unregisterAuthObserver();
  });

  return (
    <AuthContext.Provider value={{ authUser, changeAuthUser: () => {}, logout: defaultAuthContext.logout }}>
      <SettingContext.Provider
        value={{
          setting,
          changeLanguage,
          changeRounding,
          changeAutoHide,
          changeAutoHideSensitivity,
          changeDarkMode,
          changeDarkModeFastSwitch,
          changeLanguageFastSwitch,
          changePersistence,
        }}>
        <ConfigProvider
          locale={setting.language === 'en' ? enUS : thTH}
          prefixCls={setting.darkMode ? 'antdark' : 'ant'}>
          <div className='App'>
            <Router>
              <ScrollToTop />
              <Switch>
                {route.map((r) =>
                  r.private ? (
                    <Route
                      key={r.path}
                      path={r.path}
                      render={({ location }) =>
                        authUser.uid ? (
                          r.page
                        ) : (
                          <Redirect to={{ pathname: '/login', search: `redirect=${encodeLocation(location)}` }} />
                        )
                      }
                    />
                  ) : (
                    <Route key={r.path} path={r.path}>
                      {r.page}
                    </Route>
                  )
                )}
              </Switch>
            </Router>
          </div>
        </ConfigProvider>
      </SettingContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
