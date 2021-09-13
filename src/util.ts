import { useLocation } from 'react-router-dom';

export const localStorage = {
  set: (key: string, value: any) => {
    if (window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  },
  get: (key: string) => {
    return window.localStorage ? JSON.parse(window.localStorage.getItem(key) || 'null') : null;
  },
  remove: (key: string) => {
    if (window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

export const sessionStorage = {
  set: (key: string, value: any) => {
    if (window.sessionStorage) {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    }
  },
  get: (key: string) => {
    return window.sessionStorage ? JSON.parse(window.localStorage.getItem(key) || 'null') : null;
  },
  remove: (key: string) => {
    if (window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
  },
};

export const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export const decodeLocation = (location: string | null) => {
  try {
    if (location && location !== 'null') {
      return decodeURIComponent(escape(window.atob(location)));
    }
  } catch {}
  return '/';
};

export const encodeLocation = (location: { pathname: string; search: string; hash: string }) => {
  const { pathname, search, hash } = location;
  return window.btoa(unescape(encodeURIComponent(`${pathname}${search}${hash}`)));
};

export const mergeString = (s1: string, s2: string, join?: string) => {
  let from = 0;
  for (let i = s1.length - 1; i >= 0 && s1.length - i <= s2.length; i--) {
    if (s1.charAt(i) === s2.charAt(0) && s2.startsWith(s1.substr(i))) {
      from = s1.length - i;
    }
  }
  return s1.concat(join && s1.length > 0 && s2.length > 0 ? join : '', s2.substr(from));
};

const nf0 = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 });
const nf4 = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 4 });

export const numberFormat = (num: number, fraction = 4) => {
  switch (fraction) {
    case 4:
      return nf4.format(num);
    case 2:
      return nf2.format(num);
    case 0:
      return nf0.format(num);
  }
  return new Intl.NumberFormat('th-TH', { maximumFractionDigits: fraction }).format(num);
};
