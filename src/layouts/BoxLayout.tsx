import { Card, Layout } from 'antd';
import React, { PropsWithChildren } from 'react';
import { MyFooter } from '../components/MyFooter';
import './BoxLayout.less';

const { Content } = Layout;

export function BoxLayout({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <Layout className="BoxLayout">
      <Content className="BoxLayout__Content">
        <Card>
          <div className={className}>{children}</div>
        </Card>
      </Content>
      <MyFooter />
    </Layout>
  );
}
