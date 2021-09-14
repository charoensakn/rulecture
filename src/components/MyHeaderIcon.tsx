import { CloseOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import React, { Fragment, PropsWithChildren } from 'react';
import './MyHeaderIcon.less';

export function MyHeaderIcon({
  icon,
  title,
  avatar = false,
  menu = -1,
  activeMenu = 0,
  windowWidth,
  onClick,
  onClose,
  children,
}: PropsWithChildren<{
  icon: JSX.Element;
  title?: string;
  avatar?: boolean;
  menu?: number;
  activeMenu?: number;
  windowWidth?: number;
  onClick?: Function;
  onClose?: Function;
}>) {
  const popup = (
    <Card
      className="MyHeaderIcon__Content"
      title={title}
      extra={
        <Button type="text" onClick={() => onClose && onClose()}>
          <CloseOutlined />
        </Button>
      }>
      {children}
    </Card>
  );

  return (
    <Fragment>
      <div className="MyHeaderIcon">
        <div className={avatar ? 'MyHeaderIcon__Avatar' : 'MyHeaderIcon__Button'} onClick={() => onClick && onClick()}>
          {icon}
        </div>
        {activeMenu == menu && windowWidth && windowWidth >= 576 && popup}
      </div>
      {activeMenu == menu && windowWidth && windowWidth < 576 && popup}
    </Fragment>
  );
}
