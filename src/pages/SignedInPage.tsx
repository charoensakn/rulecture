import { Col, Divider, Row, Space } from 'antd';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { MyAvatar } from '../components/MyAvatar';
import { AuthContext } from '../ctx';
import { BoxLayout } from '../layouts/BoxLayout';
import { decodeLocation, useQuery } from '../util';
import './SignedInPage.less';

export function SignedInPage() {
  const { auth } = useContext(AuthContext);
  const q = useQuery();
  const redirectUrl = decodeLocation(q.get('redirect'));
  const matches = redirectUrl.match(/([^?#]+).*/);

  let to;
  if (matches && ['/login', '/signed-in', '/logout'].indexOf(matches[1] || '/') >= 0) {
    to = '/';
  } else {
    to = redirectUrl || '/';
  }
  const vals: any = {
    รหัสนักศึกษา: auth.studentId,
    อีเมล: auth.email,
    เบอร์ติดต่อ: auth.phoneNumber,
  };

  return (
    <BoxLayout className='SignedInPage'>
      <Space className='SignedInPage__Space' direction='vertical' size='large'>
        <MyAvatar size={72} />
        <h2>{auth.displayName}</h2>
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
            กลับสู่หน้าหลัก
          </Link>
        </Col>
      </Row>
    </BoxLayout>
  );
}
