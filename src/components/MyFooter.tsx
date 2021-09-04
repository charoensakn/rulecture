import { GithubOutlined, MailOutlined, MessageOutlined } from '@ant-design/icons';
import { Layout, Popover, Space } from 'antd';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { lineqrcode } from '../assets';
import { AuthContext } from '../ctx';
import './MyFooter.less';

const { Footer } = Layout;

export function MyFooter() {
  const { auth } = useContext(AuthContext);
  const { t } = useTranslation();

  return (
    <Footer>
      <div className='MyFooter'>
        <p>{t('footer_notice')}</p>
        <Space direction='horizontal' size='middle'>
          <a href='https://github.com/charoensakn/rulecture' target='_blank'>
            <GithubOutlined />
          </a>
          {auth.uid && (
            <Popover
              placement='top'
              content={<img src={lineqrcode} width={200} height={200} alt='LINE' />}
              trigger='click'
            >
              <a>
                <MessageOutlined />
              </a>
            </Popover>
          )}
          {auth.uid && (
            <a href='mailto:6302014482@rumail.ru.ac.th'>
              <MailOutlined />
            </a>
          )}
        </Space>
      </div>
    </Footer>
  );
}
