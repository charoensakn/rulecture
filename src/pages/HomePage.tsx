import { Card, Col, Row } from 'antd';
import React from 'react';
import { AppLayout } from '../layouts/AppLayout';
import './HomePage.less';

export function HomePage() {
  const children = [];
  for (let i = 0; i < 10; i++)
    children.push(
      <Col key={i} xs={24} sm={12} md={8} lg={6} xxl={4}>
        <div className='HomePage__Container'>
          <Card>
            <div className='HomePage__Card'></div>
          </Card>
        </div>
      </Col>
    );
  return (
    <AppLayout className='HomePage'>
      <Row gutter={[16, 16]}>{children}</Row>
    </AppLayout>
  );
}
