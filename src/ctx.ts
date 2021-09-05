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

export type Setting = {
  language?: string;
  rounding?: number;
  darkMode?: boolean;
  autoHide?: boolean;
  autoHideSensitivity?: number;
};
export type ChangeLanguageFn = (value: string) => void;
export type ChangeRoundingFn = (value: number) => void;
export type ChangeDarkModeFn = (value: boolean) => void;
export type ChangeAutoHideFn = (value: boolean) => void;
export type ChangeAutoHideSensitivityFn = (value: number) => void;

export const SettingContext = createContext<{
  setting: Setting;
  changeLanguage: ChangeLanguageFn;
  changeRounding: ChangeRoundingFn;
  changeDarkMode: ChangeDarkModeFn;
  changeAutoHide: ChangeAutoHideFn;
  changeAutoHideSensitivity: ChangeAutoHideSensitivityFn;
}>({
  setting: {},
  changeLanguage: () => {},
  changeRounding: () => {},
  changeDarkMode: () => {},
  changeAutoHide: () => {},
  changeAutoHideSensitivity: () => {},
});
