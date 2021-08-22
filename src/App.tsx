import firebase from 'firebase/app';
import 'firebase/auth';
import React, { useCallback, useContext, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import './App.less';
import { Auth, AuthContext, LoginFn, LogoutFn } from './ctx';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SignedInPage } from './pages/SignedInPage';
import { encodeLocation, localStorage } from './util';

const LASTLOGIN_KEY = 'lastlogin';

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

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      <div className='App'>
        <Router>
          <Switch>
            <Route path='/login'>
              <LoginPage />
            </Route>
            <Route path='/logout'>
              <LogoutPage />
            </Route>
            <PrivateRoute path='/signed-in'>
              <SignedInPage />
            </PrivateRoute>
            <PrivateRoute path='/public'>
              <div>Public Page</div>
            </PrivateRoute>
            <PrivateRoute path='/protected'>
              <div>Protected Page</div>
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
  );
}

export default App;
