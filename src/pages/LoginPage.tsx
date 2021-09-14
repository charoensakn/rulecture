import { Space, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { MyLoginButton } from '../components/MyLoginButton';
import { AuthContext } from '../contexts/auth';
import { BoxLayout } from '../layouts/BoxLayout';
import { sessionStorage, useQuery } from '../util';
import './LoginPage.less';

const { Text, Title } = Typography;

export function LoginPage() {
  const [offline, setOffline] = useState(false);

  const { authUser } = useContext(AuthContext);
  const q = useQuery();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authUser.uid && !offline) {
      (async () => {
        try {
          await fetch('https://connectivitycheck.gstatic.com/generate_204', { mode: 'no-cors' });
        } catch {
          setOffline(true);
        }
      })();
    }
  });

  const redirect = sessionStorage.get('redirect');

  return (
    <BoxLayout className="LoginPage">
      <Space direction="vertical" size="large">
        <img className="LoginPage__Logo" src="/icons-192.png" alt="Logo" />
        <Title level={3}>RU Lecture</Title>
        <Title level={5}>{t('loginpage_appdesc')}</Title>
        {authUser.uid ? (
          <Redirect to={{ pathname: '/signed-in', search: redirect ? `redirect=${redirect}` : undefined }} />
        ) : (
          <div>
            <div style={{ display: offline ? 'inherit' : 'none' }}>
              <Text type="danger">{t('loginpage_noconnection')}</Text>
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
