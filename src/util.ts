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
