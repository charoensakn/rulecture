import { Col, Divider, Row, Space, Typography } from 'antd';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MyAvatar } from '../components/MyAvatar';
import { AuthContext } from '../ctx';
import { BoxLayout } from '../layouts/BoxLayout';
import { decodeLocation, useQuery } from '../util';
import './SignedInPage.less';

export function SignedInPage() {
  const { auth } = useContext(AuthContext);
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
  const vals: any = {};
  vals[t('studentid')] = auth.studentId;
  vals[t('email')] = auth.email;
  vals[t('phone')] = auth.phoneNumber;

  return (
    <BoxLayout className='SignedInPage'>
      <Space className='SignedInPage__Space' direction='vertical' size='large'>
        <MyAvatar size={72} />
        <Typography.Title level={5}>{auth.displayName}</Typography.Title>
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
            {t('backtohome')}
          </Link>
        </Col>
      </Row>
    </BoxLayout>
  );
}
