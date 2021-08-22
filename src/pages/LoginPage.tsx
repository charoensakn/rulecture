import { Space } from 'antd';
import firebase from 'firebase/app';
import 'firebase/auth';
import { useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { MyLoginButton } from '../components/MyLoginButton';
import { AuthContext } from '../ctx';
import { BoxLayout } from '../layouts/BoxLayout';
import { useQuery } from '../util';
import './LoginPage.less';

export function LoginPage() {
  const { auth, login } = useContext(AuthContext);
  const q = useQuery();

  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        login(user);
      }
    });
    return () => unregisterAuthObserver();
  }, []);

  return (
    <BoxLayout className='LoginPage'>
      <Space direction='vertical' size='large'>
        <img className='LoginPage__Logo' src='/icons-192.png' alt='Logo' />
        <h2>RU Lecture</h2>
        <strong>แอปพลิเคชันสำหรับเผยแพร่สื่อการเรียนต่างๆ สำหรับนักศึกษามหาวิทยาลัยรามคำแหง</strong>
        {auth.uid ? (
          <Redirect to={{ pathname: '/signed-in', search: `redirect=${q.get('redirect')}` }} />
        ) : (
          <MyLoginButton />
        )}
      </Space>
    </BoxLayout>
  );
}
