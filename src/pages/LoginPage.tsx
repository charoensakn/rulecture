import { Space, Typography } from 'antd';
import firebase from 'firebase/app';
import 'firebase/auth';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { MyLoginButton } from '../components/MyLoginButton';
import { AuthContext } from '../ctx';
import { BoxLayout } from '../layouts/BoxLayout';
import { useQuery } from '../util';
import './LoginPage.less';

const { Text, Title } = Typography;

export function LoginPage() {
  const [offline, setOffline] = useState(false);

  const { auth, login } = useContext(AuthContext);
  const q = useQuery();
  const { t } = useTranslation();

  useEffect(() => {
    fetch('https://connectivitycheck.gstatic.com/generate_204', { mode: 'no-cors' }).catch(() => setOffline(true));
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        login(user);
      }
    });
    return () => unregisterAuthObserver();
  }, []);

  return (
    <BoxLayout className='LoginPage'>
      <Space direction='vertical' size='large'>
        <img className='LoginPage__Logo' src='/icons-192.png' alt='Logo' />
        <Title level={3}>RU Lecture</Title>
        <Title level={5}>{t('loginpage_appdesc')}</Title>
        {auth.uid ? (
          <Redirect to={{ pathname: '/signed-in', search: `redirect=${q.get('redirect')}` }} />
        ) : (
          <div>
            <div style={{ display: offline ? 'inherit' : 'none' }}>
              <Text type='danger'>{t('loginpage_noconnection')}</Text>
            </div>
            <div style={{ display: offline ? 'none' : 'inherit' }}>
              <MyLoginButton />
            </div>
          </div>
        )}
      </Space>
    </BoxLayout>
  );
}
