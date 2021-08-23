import { Col, Row, Space } from 'antd';
import { Link } from 'react-router-dom';
import { BoxLayout } from '../layouts/BoxLayout';

export function NotFoundPage() {
  return (
    <BoxLayout>
      <Space direction='vertical' size='large'>
        <Row>
          <Col span={24}>
            <h3>ไม่พบหน้าที่คุณกำลังเรียก หน้าอาจถูกย้ายหรือถูกลบไปแล้ว</h3>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Link to={'/'}>กลับไปยังหน้าหลัก</Link>
          </Col>
        </Row>
      </Space>
    </BoxLayout>
  );
}
