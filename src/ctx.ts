import firebase from 'firebase/app';
import 'firebase/auth';
import { createContext } from 'react';

export type Auth = {
  uid?: string;
  studentId?: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
};
export type LoginFn = (user: firebase.User) => void;
export type LogoutFn = () => Promise<void>;

export const AuthContext = createContext<{ auth: Auth; login: LoginFn; logout: LogoutFn }>({
  auth: {},
  login: () => {},
  logout: () => Promise.resolve(),
});
