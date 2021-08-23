import { Space, Typography } from 'antd';
import firebase from 'firebase/app';
import 'firebase/auth';
import { useContext, useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { MyLoginButton } from '../components/MyLoginButton';
import { AuthContext } from '../ctx';
import { BoxLayout } from '../layouts/BoxLayout';
import { useQuery } from '../util';
import './LoginPage.less';

const { Text } = Typography;

export function LoginPage() {
  const [offline, setOffline] = useState(false);

  const { auth, login } = useContext(AuthContext);
  const q = useQuery();

  useEffect(() => {
    fetch('https://connectivitycheck.gstatic.com/generate_204', { mode: 'no-cors' }).catch(() => setOffline(true));
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
          <div>
            <div style={{ display: offline ? 'inherit' : 'none' }}>
              <Text type='danger'>ไม่สามารถเชื่อมต่อระบบล็อกอินได้ในขณะนี้</Text>
            </div>
            <div style={{ display: offline ? 'none' : 'inherit' }}>
              <MyLoginButton />
            </div>
          </div>
        )}
      </Space>
    </BoxLayout>
  );
}
