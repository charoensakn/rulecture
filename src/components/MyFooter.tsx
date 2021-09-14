import { GithubOutlined, MailOutlined, MessageOutlined } from '@ant-design/icons';
import { Layout, Popover, Space, Typography } from 'antd';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { lineqrcode } from '../assets';
import { AuthContext } from '../contexts/auth';
import './MyFooter.less';

const { Footer } = Layout;
const { Link } = Typography;

export function MyFooter() {
  const { authUser } = useContext(AuthContext);
  const { t } = useTranslation();

  return (
    <Footer>
      <div className='MyFooter'>
        <p>{t('footer_notice')}</p>
        <Space direction='horizontal' size='middle'>
          <Link type='secondary' href='https://github.com/charoensakn/rulecture' target='_blank'>
            <GithubOutlined />
          </Link>
          {authUser.uid && (
            <Popover
              placement='top'
              content={<img src={lineqrcode} width={200} height={200} alt='LINE' />}
              trigger='click'>
              <Link type='secondary'>
                <MessageOutlined />
              </Link>
            </Popover>
          )}
          {authUser.uid && (
            <Link type='secondary' href='mailto:6302014482@rumail.ru.ac.th'>
              <MailOutlined />
            </Link>
          )}
        </Space>
      </div>
    </Footer>
  );
}
