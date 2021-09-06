import { Col, Row, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppBoxLayout } from '../layouts/AppBoxLayout';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <AppBoxLayout>
      <Space direction='vertical' size='large'>
        <Row>
          <Col span={24}>
            <Typography.Title level={5}>{t('pagenotfound')}</Typography.Title>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Link to={'/'}>{t('backtohome')}</Link>
          </Col>
        </Row>
      </Space>
    </AppBoxLayout>
  );
}
