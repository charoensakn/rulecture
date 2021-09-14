import { Col, Row, Space, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/auth';
import { BoxLayout } from '../layouts/BoxLayout';

export function LogoutPage() {
  const { logout } = useContext(AuthContext);
  const [loggedOut, setLoggedOut] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      await logout();
      setLoggedOut(true);
    })();
  }, []);

  return (
    <BoxLayout>
      <Space direction='vertical' size='large'>
        <Row>
          <Col span={24}>
            <Typography.Title level={5}>
              {t(loggedOut ? 'logoutpage_loggedout' : 'logoutpage_loggingout')}
            </Typography.Title>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Link to={'/login'}>{t('backtologin')}</Link>
          </Col>
        </Row>
      </Space>
    </BoxLayout>
  );
}
