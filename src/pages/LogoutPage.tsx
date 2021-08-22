import { Col, Row, Space } from 'antd';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../ctx';
import { BoxLayout } from '../layouts/BoxLayout';

export function LogoutPage() {
  const { logout } = useContext(AuthContext);
  const [loggedOut, setLoggedOut] = useState(false);

  const fn = useCallback(async () => {
    await logout();
    setLoggedOut(true);
  }, []);
  useEffect(() => {
    fn();
  }, [fn]);

  return (
    <BoxLayout>
      <Space direction='vertical' size='large'>
        <Row>
          <Col span={24}>
            <h2>{loggedOut ? 'ออกจากระบบเรียบร้อยแล้ว' : 'กำลังออกจากระบบ'}</h2>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Link to={'/login'}>กลับไปยังหน้าล็อกอิน</Link>
          </Col>
        </Row>
      </Space>
    </BoxLayout>
  );
}
