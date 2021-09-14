import { getAuth, User } from 'firebase/auth';
import { createContext } from 'react';
import { localStorage } from '../util';

const LASTLOGIN_KEY = 'lastlogin';

export type AuthUser = {
  uid?: string;
  studentId?: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
};

export function getAuthUser(user?: User | null): AuthUser {
  if (user === undefined) {
    const auth = localStorage.get(LASTLOGIN_KEY);
    const u = getAuth().currentUser;
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

export type ChangeAuthUserFn = (authUser: AuthUser) => void;
export type LogoutFn = () => Promise<void>;

export const AuthContext = createContext<{
  authUser: AuthUser;
  changeAuthUser: ChangeAuthUserFn;
  logout: LogoutFn;
}>({
  authUser: localStorage.get(LASTLOGIN_KEY) || {},
  changeAuthUser: (authUser) => {
    localStorage.set(LASTLOGIN_KEY, authUser);
  },
  logout: async () => {
    return getAuth().signOut();
  },
});
