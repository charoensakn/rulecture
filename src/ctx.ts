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
export type PushRecentLocationFn = (name: string, url: string) => Promise<void>;

export const AuthContext = createContext<{
  auth: Auth;
  login: LoginFn;
  logout: LogoutFn;
  pushRecentLocation: PushRecentLocationFn;
}>({
  auth: {},
  login: () => {},
  logout: () => Promise.resolve(),
  pushRecentLocation: () => Promise.resolve(),
});

export type Setting = {
  language?: string;
  rounding?: number;
  darkMode?: boolean;
  autoHide?: boolean;
  autoHideSensitivity?: number;
  persistence?: boolean;
};
export type ChangeStringFn = (value: string) => void;
export type ChangeNumberFn = (value: number) => void;
export type ChangeBooleanFn = (value: boolean) => void;

export const SettingContext = createContext<{
  setting: Setting;
  changeLanguage: ChangeStringFn;
  changeRounding: ChangeNumberFn;
  changeDarkMode: ChangeBooleanFn;
  changeAutoHide: ChangeBooleanFn;
  changeAutoHideSensitivity: ChangeNumberFn;
  changePersistence: ChangeBooleanFn;
}>({
  setting: {},
  changeLanguage: () => {},
  changeRounding: () => {},
  changeDarkMode: () => {},
  changeAutoHide: () => {},
  changeAutoHideSensitivity: () => {},
  changePersistence: () => {},
});
