import { Card } from 'antd';
import { PropsWithChildren } from 'react';
import './BoxLayout.less';

export function BoxLayout({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className='BoxLayout'>
      <div className='BoxLayout__Card'>
        <Card>
          <div className={className}>{children}</div>
        </Card>
      </div>
    </div>
  );
}
