import { GoogleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { getAuth, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { sessionStorage, useQuery } from '../util';

const provider = new GoogleAuthProvider();
provider.addScope('profile');
provider.addScope('email');
provider.setCustomParameters({
  prompt: 'select_account',
});

export function MyLoginButton() {
  const q = useQuery();
  const { t } = useTranslation();

  useEffect(() => {
    sessionStorage.set('redirect', q.get('redirect'));
  });

  return (
    <Button type='primary' icon={<GoogleOutlined />} onClick={() => signInWithRedirect(getAuth(), provider)}>
      {t('login')}
    </Button>
  );
}
