import { Col, Row, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { BoxLayout } from '../layouts/BoxLayout';

const { Title } = Typography;

export function NotFoundPage() {
  return (
    <BoxLayout>
      <Space direction='vertical' size='large'>
        <Row>
          <Col span={24}>
            <Title level={5}>ไม่พบหน้าที่คุณกำลังเรียก หน้าอาจถูกย้ายหรือถูกลบไปแล้ว</Title>
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
