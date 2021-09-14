import { ConfigProvider } from 'antd';
import i18n from 'i18next';
import { createContext } from 'react';
import { localStorage } from '../util';

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

export type Setting = {
  language: string;
  rounding: number;
  darkMode: boolean;
  autoHide: boolean;
  autoHideSensitivity: number;
  persistence: boolean;
  languageFastSwitch: boolean;
  darkModeFastSwitch: boolean;
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
  changeLanguageFastSwitch: ChangeBooleanFn;
  changeDarkModeFastSwitch: ChangeBooleanFn;
}>({
  setting: {
    language: localStorage.get(LANG_KEY) || 'th',
    rounding: localStorage.get(ROUNDING_KEY) || 0,
    darkMode: localStorage.get(DARKMODE_KEY) || false,
    autoHide: localStorage.get(AUTOHIDE_KEY) || true,
    autoHideSensitivity: localStorage.get(AUTOHIDESENSE_KEY) || 10,
    persistence: localStorage.get(PERSISTENCE_KEY) || false,
    languageFastSwitch: localStorage.get(DARKMODEFAST_KEY) || false,
    darkModeFastSwitch: localStorage.get(LANGUAGEFAST_KEY) || false,
  },
  changeLanguage: (value) => {
    localStorage.set(LANG_KEY, value);
    i18n.changeLanguage(value);
  },
  changeRounding: (value) => {
    localStorage.set(ROUNDING_KEY, value);
  },
  changeDarkMode: (value) => {
    switchTheme(value);
    localStorage.set(DARKMODE_KEY, value);
  },
  changeAutoHide: (value) => {
    localStorage.set(AUTOHIDE_KEY, value);
  },
  changeAutoHideSensitivity: (value) => {
    localStorage.set(AUTOHIDESENSE_KEY, value);
  },
  changePersistence: (value) => {
    localStorage.set(PERSISTENCE_KEY, value);
  },
  changeLanguageFastSwitch: (value) => {
    localStorage.set(LANGUAGEFAST_KEY, value);
  },
  changeDarkModeFastSwitch: (value) => {
    localStorage.set(DARKMODEFAST_KEY, value);
  },
});
