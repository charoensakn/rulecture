import firebase from 'firebase/app';
import 'firebase/auth';
import React from 'react';
import { StyledFirebaseAuth } from 'react-firebaseui';
import { useQuery } from '../util';

export function MyLoginButton() {
  const q = useQuery();
  const uiConfig: firebaseui.auth.Config = {
    signInFlow: 'redirect',
    signInSuccessUrl: `/login?redirect=${q.get('redirect')}`,
    credentialHelper: 'none',
    autoUpgradeAnonymousUsers: false,
    immediateFederatedRedirect: false,
    signInOptions: [
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        scopes: [
          'https://www.googleapis.com/auth/userinfo.email', //
          'https://www.googleapis.com/auth/userinfo.profile',
        ],
        customParameters: {
          prompt: 'select_account',
        },
      },
    ],
  };
  return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />;
}
