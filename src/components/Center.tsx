import React, { PropsWithChildren } from 'react';
import './Center.less';

export function Center({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={`Center${className ? ` ${className}` : ''}`}>{children}</div>;
}
