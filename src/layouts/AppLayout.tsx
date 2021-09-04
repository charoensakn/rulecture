import {
  BellFilled,
  HomeFilled,
  InfoCircleOutlined,
  LogoutOutlined,
  MenuOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Affix, Breadcrumb, Descriptions, Drawer, Empty, Layout, Menu, Space } from 'antd';
import React, { Fragment, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MyAvatar } from '../components/MyAvatar';
import { MyFooter } from '../components/MyFooter';
import { MyHeaderIcon } from '../components/MyHeaderIcon';
import { AuthContext } from '../ctx';
import './AppLayout.less';
import packageJson from '../../package.json';

const { Header, Content } = Layout;

export function AppLayout({ className, children }: PropsWithChildren<{ className?: string }>) {
  const [drawerShowed, setDrawerShowed] = useState(false);
  const [headerShowed, setHeaderShowed] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [informationText, setInformationText] = useState('');
  const [activeMenu, setActiveMenu] = useState(0);

  const { auth } = useContext(AuthContext);
  const { t } = useTranslation();

  let lastScrollY = 0;
  let lastScrollTime = 0;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      setInformationText(t('applayout_info_installing_pwa'));
    }
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollTime = Date.now();
      if (scrollY > 100) {
        const v = (scrollY - lastScrollY) / (scrollTime - lastScrollTime);
        if (v < -0.2 && !headerShowed) {
          setHeaderShowed(true);
        } else if (v > 0.2 && headerShowed) {
          setHeaderShowed(false);
        }
        lastScrollY = scrollY;
        lastScrollTime = scrollTime;
      } else if (!headerShowed) {
        setHeaderShowed(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headerShowed]);

  const links = [];
  if (windowWidth >= 768) {
    links.push(
      <Breadcrumb.Item key={'home'} className='AppLayout__Link'>
        <Link to='/'>{t('/')}</Link>
      </Breadcrumb.Item>
    );
  }
  if (windowWidth >= 576) {
    links.push(
      <Breadcrumb.Item key={'submenu'} className='AppLayout__Link'>
        <Link to='/lectures'>{t('/lectures')}</Link>
      </Breadcrumb.Item>
    );
  }
  links.push(
    <Breadcrumb.Item key={'current'} className='AppLayout__Link--current'>
      {'FIN2101'}
    </Breadcrumb.Item>
  );

  const noti = <Empty description={t('applayout_noti_nodata')} />;

  const account = (
    <div className='AppLayout__PopoverMenu'>
      {windowHeight >= 576 && (
        <Fragment>
          <p>
            <strong>{auth.displayName}</strong>
          </p>
          <p>{auth.email}</p>
        </Fragment>
      )}
      <Menu>
        <Menu.Item key='profile' icon={<UserOutlined />}>
          <Link to='/profile'>{t('applayout_account_profile')}</Link>
        </Menu.Item>
        <Menu.Item key='setting' icon={<SettingOutlined />}>
          <Link to='/setting'>{t('applayout_account_setting')}</Link>
        </Menu.Item>
        <Menu.Item key='logout' icon={<LogoutOutlined />}>
          <Link to='/logout'>{t('applayout_account_logout')}</Link>
        </Menu.Item>
      </Menu>
    </div>
  );

  return (
    <Layout className='AppLayout'>
      <Affix className={headerShowed ? '' : 'AppLayout__Header--hide'}>
        <Header className='AppLayout__Header'>
          <Space size='small'>
            <MyHeaderIcon icon={<MenuOutlined />} onClick={() => setDrawerShowed(true)} />
            <Link to='/'>
              <MyHeaderIcon icon={<HomeFilled />} />
            </Link>
            <Breadcrumb>{links}</Breadcrumb>
          </Space>
          <div className='AppLayout__Fill'></div>
          <Space size='small'>
            <MyHeaderIcon
              key={1}
              menu={1}
              icon={<InfoCircleOutlined />}
              title={t('applayout_info_title')}
              activeMenu={activeMenu}
              windowWidth={windowWidth}
              onClick={() => setActiveMenu(1)}
              onClose={() => setActiveMenu(0)}
            >
              {informationText || (
                <Descriptions bordered size='small' column={1}>
                  <Descriptions.Item label={t('applayout_appname')}>{packageJson.name}</Descriptions.Item>
                  <Descriptions.Item label={t('applayout_appversion')}>{packageJson.version}</Descriptions.Item>
                  <Descriptions.Item label={t('applayout_appdesc')}>{packageJson.description}</Descriptions.Item>
                  <Descriptions.Item label={t('applayout_appuid')}>{auth.uid}</Descriptions.Item>
                </Descriptions>
              )}
            </MyHeaderIcon>
            <MyHeaderIcon
              key={2}
              menu={2}
              icon={<BellFilled />}
              title={t('applayout_noti_title')}
              activeMenu={activeMenu}
              windowWidth={windowWidth}
              onClick={() => setActiveMenu(2)}
              onClose={() => setActiveMenu(0)}
            >
              {noti}
            </MyHeaderIcon>
            <MyHeaderIcon
              key={3}
              menu={3}
              icon={<MyAvatar />}
              avatar
              title={t('applayout_account_title')}
              activeMenu={activeMenu}
              windowWidth={windowWidth}
              onClick={() => setActiveMenu(3)}
              onClose={() => setActiveMenu(0)}
            >
              {account}
            </MyHeaderIcon>
          </Space>
        </Header>
      </Affix>
      <Content className='AppLayout__Content'>
        <div className={className}>{children}</div>
      </Content>
      <MyFooter />
      <Drawer
        title={t('applayout_drawer_title')}
        placement='left'
        closable
        onClose={() => setDrawerShowed(false)}
        visible={drawerShowed}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </Layout>
  );
}
