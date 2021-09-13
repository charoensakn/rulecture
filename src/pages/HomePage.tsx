import { Card, Col, Row, Typography } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import './HomePage.less';

const { Text, Title } = Typography;

export function HomePage() {
  const { t } = useTranslation();

  const apps = [
    {
      title: 'LINE ACC4200 S/63',
      desc: 'รายงานการเข้ากลุ่ม LINE OpenChat ACC4200 S/63',
      link: '/apps/linereport/acc4200s63',
    },
    {
      title: 'LINE ACC4252 S/63',
      desc: 'รายงานการเข้ากลุ่ม LINE OpenChat ACC4252 S/63',
      link: '/apps/linereport/acc4252s63',
    },
    {
      title: 'โปรแกรมคำนวณคะแนน',
      desc: 'โปรแกรมคำนวณคะแนนข้อสอบปรนัยที่สร้างด้วย Google Form [BETA]',
      link: '/apps/grading',
    },
  ];

  return (
    <AppLayout className='HomePage'>
      <Title level={3}>{t('apps')}</Title>
      <Row gutter={[16, 16]}>
        {apps.map((app) => (
          <Col key={app.link} xs={24} sm={12} md={8} lg={6}>
            <div className='HomePage__Container'>
              <Link to={app.link}>
                <Card title={app.title}>
                  <Text>{app.desc}</Text>
                </Card>
              </Link>
            </div>
          </Col>
        ))}
      </Row>
    </AppLayout>
  );
}
