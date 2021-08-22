import { UserOutlined } from '@ant-design/icons';
import { Avatar, AvatarProps } from 'antd';
import React, { PropsWithoutRef, useContext } from 'react';
import { AuthContext } from '../ctx';
import './MyAvatar.less';

export function MyAvatar({ size = 'default', shape = 'circle' }: PropsWithoutRef<AvatarProps>) {
  const { auth } = useContext(AuthContext);
  let child = <Avatar icon={<UserOutlined />} size={size} shape={shape} />;
  if (auth) {
    if (auth.photoURL) {
      child = <Avatar src={auth.photoURL} size={size} shape={shape} />;
    } else {
      const matches = auth.displayName?.match(/([a-zA-Zก-ฮ])/);
      if (matches) {
        child = (
          <Avatar size={size} shape={shape}>
            <span className='MyAvatar__Text'>{matches[1]}</span>
          </Avatar>
        );
      }
    }
  }
  return <div className='MyAvatar'>{child}</div>;
}
