import { Card } from 'antd';
import React, { PropsWithChildren, useContext } from 'react';
import { AuthContext } from '../contexts/auth';
import './AppBoxLayout.less';
import { AppLayout } from './AppLayout';
import { BoxLayout } from './BoxLayout';

export function AppBoxLayout({ className, children }: PropsWithChildren<{ className?: string }>) {
  const { authUser } = useContext(AuthContext);
  return authUser.uid ? (
    <AppLayout className={className}>
      <Card className="AppBoxLayout--wrapper">{children}</Card>
    </AppLayout>
  ) : (
    <BoxLayout className={className}>{children}</BoxLayout>
  );
}
