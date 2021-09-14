import { Col, Divider, Row, Space, Typography } from 'antd';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MyAvatar } from '../components/MyAvatar';
import { AuthContext } from '../contexts/auth';
import { BoxLayout } from '../layouts/BoxLayout';
import { decodeLocation, sessionStorage, useQuery } from '../util';
import './SignedInPage.less';

export function SignedInPage() {
  const { authUser } = useContext(AuthContext);
  const { t } = useTranslation();
  const q = useQuery();

  const redirectUrl = decodeLocation(q.get('redirect'));
  const matches = redirectUrl.match(/([^?#]+).*/);
  let to;
  if (matches && ['/login', '/signed-in', '/logout'].indexOf(matches[1] || '/') >= 0) {
    to = '/';
  } else {
    to = redirectUrl || '/';
  }
  sessionStorage.remove('redirect');

  const vals: any = {};
  vals[t('studentid')] = authUser.studentId;
  vals[t('email')] = authUser.email;
  vals[t('phone')] = authUser.phoneNumber;

  return (
    <BoxLayout className='SignedInPage'>
      <Space className='SignedInPage__Space' direction='vertical' size='large'>
        <MyAvatar size={72} />
        <Typography.Title level={5}>{authUser.displayName}</Typography.Title>
        <Divider />
        {Object.keys(vals).map((key) => (
          <Row key={key}>
            <Col className='SignedInPage__Label' xs={24} sm={8}>
              {key}
            </Col>
            <Col className='SignedInPage__Value' xs={24} sm={16}>
              {vals[key] || '-'}
            </Col>
          </Row>
        ))}
        <Divider />
      </Space>
      <Row>
        <Col span={24}>
          <Link to={to} replace>
            {t(to === '/' ? 'backtohome' : 'backtoprevious')}
          </Link>
        </Col>
      </Row>
    </BoxLayout>
  );
}
