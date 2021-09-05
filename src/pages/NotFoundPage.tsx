import { Col, Row, Space } from 'antd';
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
            <h3>{t('pagenotfound')}</h3>
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
