import { Col, Row, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import { AppBoxLayout } from '../layouts/AppBoxLayout';

export function NotFoundPage() {
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <AppBoxLayout className="NotFoundPage">
      <Space direction="vertical" size="large">
        <Row>
          <Col span={24}>
            <Typography.Title level={5}>{t('pagenotfound')}</Typography.Title>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            {history.action === 'REPLACE' ? (
              <Link to={'/'} replace>
                {t('backtohome')}
              </Link>
            ) : (
              <Typography.Link onClick={() => history.goBack()}>{t('backtoprevious')}</Typography.Link>
            )}
          </Col>
        </Row>
      </Space>
    </AppBoxLayout>
  );
}
