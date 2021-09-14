import { UserOutlined } from '@ant-design/icons';
import { Avatar, AvatarProps } from 'antd';
import React, { PropsWithoutRef, useContext } from 'react';
import { AuthContext } from '../contexts/auth';

export function MyAvatar({ size = 'default', shape = 'circle' }: PropsWithoutRef<AvatarProps>) {
  const { authUser } = useContext(AuthContext);
  let child = <Avatar icon={<UserOutlined />} size={size} shape={shape} />;
  if (authUser.uid) {
    if (authUser.photoURL) {
      child = <Avatar src={authUser.photoURL} size={size} shape={shape} />;
    } else {
      const matches = authUser.displayName?.match(/([A-Z])/);
      if (matches) {
        let fontSize = 0;
        if (typeof size === 'number') {
          fontSize = size / 2;
        }
        child = (
          <Avatar size={size} shape={shape}>
            <span className='MyAvatar__Text' style={{ fontSize: fontSize > 0 ? `${fontSize}px` : undefined }}>
              {matches[1]}
            </span>
          </Avatar>
        );
      }
    }
  }
  return <div className='MyAvatar'>{child}</div>;
}
