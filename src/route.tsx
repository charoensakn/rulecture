import { GradingPage } from './pages/grading/GradingPage';
import { HomePage } from './pages/HomePage';
import { LineReportPage } from './pages/LineReportPage';
import { LoginPage } from './pages/LoginPage';
import { LogoutPage } from './pages/LogoutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingPage } from './pages/SettingPage';
import { SignedInPage } from './pages/SignedInPage';

export const route: { path: string; page: JSX.Element; private?: boolean }[] = [
  {
    path: '/login',
    page: <LoginPage />,
  },
  {
    path: '/logout',
    page: <LogoutPage />,
  },
  {
    path: '/pagenotfound',
    page: <NotFoundPage />,
  },
  {
    path: '/apps/grading',
    page: <GradingPage />,
  },
  {
    path: '/apps/linereport/:subject',
    page: <LineReportPage />,
  },
  {
    path: '/setting',
    page: <SettingPage />,
  },
  {
    path: '/signed-in',
    page: <SignedInPage />,
    private: true,
  },
  {
    path: '/profile',
    page: <ProfilePage />,
    private: true,
  },
  {
    path: '/',
    page: <HomePage />,
  },
  {
    path: '*',
    page: <NotFoundPage />,
  },
];
