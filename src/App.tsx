import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import thTH from 'antd/lib/locale/th_TH';
import { getAuth } from '@firebase/auth';
import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import './App.less';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthContext, ChangeAuthUserFn, getAuthUser } from './contexts/auth';
import { DataContext } from './contexts/data';
import { ChangeBooleanFn, ChangeNumberFn, ChangeStringFn, SettingContext } from './contexts/setting';
import { Material, MaterialFs } from './db/MaterialFs';
import { Notification, NotificationFs } from './db/NotificationFs';
import { SerialDb } from './db/SerialDb';
import { route } from './route';
import { encodeLocation, IndexedDB } from './util';
import { RecentLocationDb } from './db/RecentLocationDb';

function App() {
  const defaultAuthContext = useContext(AuthContext);
  const defaultSettingContext = useContext(SettingContext);

  const [authUser, setAuthUser] = useState(defaultAuthContext.authUser);
  const changeAuthUser: ChangeAuthUserFn = (authUser) => {
    setAuthUser(authUser);
    defaultAuthContext.changeAuthUser(authUser);
  };
  const [authGroups, setAuthGroups] = useState(defaultAuthContext.authGroups);

  const [setting, setSetting] = useState({ ...defaultSettingContext.setting });
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

  const [materials, setMaterials] = useState([] as (Material & { key: string })[]);
  const [notifications, setNotifications] = useState([] as (Notification & { key: string })[]);

  useEffect(() => {
    (async () => {
      try {
        const serials = await SerialDb.findUpdate();
        const idb = new IndexedDB();
        await idb.open();
        if (serials.materials > 0) {
          console.log('[app] found materials update:', serials.materials);
          const values = await MaterialFs.getAll();
          idb.storeMaterials(values);
          SerialDb.incrementLocalMaterial(serials.materials);
        } else {
          console.log('[app] load materials from cache:', serials.materials);
          setMaterials(await idb.getMaterials());
        }
        if (serials.notifications > 0) {
          console.log('[app] found notifications update:', serials.notifications);
          const values = await NotificationFs.getAll();
          idb.storeNotifications(values);
          SerialDb.incrementLocalNotification(serials.notifications);
        } else {
          console.log('[app] load notifications from cache:', serials.notifications);
          setNotifications(await idb.getNotifications());
        }
        idb.close();
      } catch (error) {
        console.error('[app] cannot load data from cache, fallback through network:', error);
        MaterialFs.getAll().then((values) => setMaterials(values));
        NotificationFs.getAll().then((values) => setNotifications(values));
      }
    })();

    const unregisterAuthObserver = getAuth().onAuthStateChanged((user) => {
      const a = getAuthUser(user);
      console.log('[app] auth uid:', a.uid);
      if (a.uid !== authUser.uid) {
        changeAuthUser(a);
      }
    });
    return () => unregisterAuthObserver();
  }, []);

  return (
    <DataContext.Provider value={{ materials, notifications }}>
      <AuthContext.Provider
        value={{ authUser, changeAuthUser: () => {}, logout: defaultAuthContext.logout, authGroups }}>
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
            <div className="App">
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
                      <Route key={r.path} path={r.path} exact={r.path === '/'}>
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
    </DataContext.Provider>
  );
}

export default App;
