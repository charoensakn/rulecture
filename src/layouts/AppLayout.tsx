import {
  ArrowLeftOutlined,
  BellFilled,
  HomeFilled,
  InfoCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Affix,
  Breadcrumb,
  Button,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Layout,
  Menu,
  Space,
  Switch,
  Typography,
} from 'antd';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import { onValue, Unsubscribe } from 'firebase/database';
import React, { Fragment, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useLocation } from 'react-router-dom';
import packageJson from '../../package.json';
import { MyAvatar } from '../components/MyAvatar';
import { MyFooter } from '../components/MyFooter';
import { MyHeaderIcon } from '../components/MyHeaderIcon';
import { AuthContext } from '../contexts/auth';
import { SettingContext } from '../contexts/setting';
import { Database } from '../db/Database';
import './AppLayout.less';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const HEADER_THRESHOLD = 90;

export function AppLayout({
  className,
  fullWidth,
  children,
}: PropsWithChildren<{ className?: string; fullWidth?: boolean }>) {
  const [drawerShowed, setDrawerShowed] = useState(false);
  const [headerShowed, setHeaderShowed] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [informationText, setInformationText] = useState('');
  const [activeMenu, setActiveMenu] = useState(0);
  const [recentLocations, setRecentLocations] = useState([] as { name: string; url: string }[]);

  const { authUser } = useContext(AuthContext);
  const { setting, changeDarkMode, changeLanguage } = useContext(SettingContext);
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const screens = useBreakpoint();

  let lastScrollY = 0;
  let lastScrollTime = 0;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    const handleScroll = () => {
      if (!setting.autoHide) {
        if (!headerShowed) {
          setHeaderShowed(true);
        }
        return;
      }
      const scrollY = window.scrollY;
      const scrollTime = Date.now();
      if (scrollY > HEADER_THRESHOLD) {
        const s = 10.1 - (setting.autoHideSensitivity || 10);
        const v = (scrollY - lastScrollY) / (scrollTime - lastScrollTime);
        if (v < -1 * s && !headerShowed) {
          setHeaderShowed(true);
        } else if (v > s && headerShowed) {
          setActiveMenu(0);
          setHeaderShowed(false);
        }
        lastScrollY = scrollY;
        lastScrollTime = scrollTime;
      } else if (!headerShowed) {
        setHeaderShowed(true);
      }
    };
    /**
     * recent locations
     */
    let handleValue: Unsubscribe | null = null;
    const recentLocationsRef = Database.recentLocationsRef();
    if (recentLocationsRef) {
      handleValue = onValue(recentLocationsRef, (snapshot) => {
        if (snapshot.exists()) {
          setRecentLocations(snapshot.val() || []);
        }
      });
    }

    window.addEventListener('scroll', handleScroll);
    /**
     * check installed pwa
     */
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      setInformationText(t('applayout_info_installing_pwa'));
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (handleValue) handleValue();
    };
  }, [authUser.uid, headerShowed]);

  const pathnames = location.pathname.split(/\/+/);
  let parentLink = '';
  let parent;
  if (pathnames.length > 2) {
    for (let i = 1; i < pathnames.length - 1; i++) {
      parentLink += `/${pathnames[i]}`;
    }
    parent = t(`/${pathnames[pathnames.length - 2]}`);
    if (parent && parent.startsWith('/')) {
      parent = parent.substr(1);
    }
  }
  let current = t(`/${pathnames[pathnames.length - 1]}`);
  if (current && current.startsWith('/')) {
    current = t('/pagenotfound');
  }
  const links: JSX.Element[] = [];
  if (windowWidth >= 768 && pathnames.length > 1 && pathnames[pathnames.length - 1]) {
    links.push(
      <Breadcrumb.Item key={'home'} className='AppLayout__Link'>
        <Link to='/'>{t('/')}</Link>
      </Breadcrumb.Item>
    );
  }
  if (windowWidth >= 576 && parentLink && parent) {
    links.push(
      <Breadcrumb.Item key={'submenu'} className='AppLayout__Link'>
        <Link to={parentLink}>{parent}</Link>
      </Breadcrumb.Item>
    );
  }
  if (current) {
    links.push(
      <Breadcrumb.Item key={'current'} className='AppLayout__Link--current'>
        {current}
      </Breadcrumb.Item>
    );
  }

  const noti = <Empty description={t('noti_nodata')} />;

  const account = (
    <div className='AppLayout__PopoverMenu'>
      {windowHeight >= 576 && (
        <Fragment>
          <p>
            <strong>{authUser.uid ? authUser.displayName : t('guest')}</strong>
          </p>
          <p>{authUser.uid && authUser.email}</p>
        </Fragment>
      )}
      <Menu>
        <Menu.Item key='profile' icon={<UserOutlined />}>
          <Link to='/profile'>{t('profile')}</Link>
        </Menu.Item>
        <Menu.Item key='setting' icon={<SettingOutlined />}>
          <Link to='/setting'>{t('setting')}</Link>
        </Menu.Item>
        {authUser.uid ? (
          <Menu.Item key='logout' icon={<LogoutOutlined />}>
            <Link to='/logout'>{t('logout')}</Link>
          </Menu.Item>
        ) : (
          <Menu.Item key='login' icon={<LoginOutlined />}>
            <Link to='/login'>{t('login')}</Link>
          </Menu.Item>
        )}
      </Menu>
    </div>
  );

  return (
    <Layout className='AppLayout'>
      <Affix className={headerShowed ? '' : 'AppLayout__Header--hide'}>
        <Header className='AppLayout__Header'>
          <Space size='small' className='AppLayout__Fill'>
            <MyHeaderIcon
              icon={<MenuOutlined />}
              onClick={() => {
                setActiveMenu(0);
                setDrawerShowed(true);
              }}
            />
            {history.action === 'PUSH' ? (
              <MyHeaderIcon
                icon={<ArrowLeftOutlined />}
                onClick={() => {
                  setActiveMenu(0);
                  history.goBack();
                }}
              />
            ) : (
              <Link to='/'>
                <MyHeaderIcon icon={<HomeFilled />} onClick={() => setActiveMenu(0)} />
              </Link>
            )}
            <Breadcrumb>{links}</Breadcrumb>
          </Space>
          <Space size='small'>
            {screens.sm && (
              <Fragment>
                {setting.languageFastSwitch && (
                  <Button shape='round' onClick={() => changeLanguage(setting.language === 'en' ? 'th' : 'en')}>
                    {setting.language === 'en' ? 'ไทย' : 'EN'}
                  </Button>
                )}
                {setting.darkModeFastSwitch && (
                  <Switch
                    checkedChildren='🌞'
                    unCheckedChildren='🌜'
                    checked={setting.darkMode}
                    onClick={() => changeDarkMode(!setting.darkMode)}
                  />
                )}
              </Fragment>
            )}
            <MyHeaderIcon
              key={1}
              menu={1}
              icon={<InfoCircleOutlined />}
              title={t('applayout_info_title')}
              activeMenu={activeMenu}
              windowWidth={windowWidth}
              onClick={() => setActiveMenu(1)}
              onClose={() => setActiveMenu(0)}>
              <Descriptions bordered size='small' column={1}>
                <Descriptions.Item label={t('name')}>{packageJson.description}</Descriptions.Item>
                <Descriptions.Item label={t('version')}>{packageJson.version}</Descriptions.Item>
              </Descriptions>
              {informationText && (
                <Fragment>
                  <Divider />
                  <Paragraph>{informationText}</Paragraph>
                </Fragment>
              )}
            </MyHeaderIcon>
            <MyHeaderIcon
              key={2}
              menu={2}
              icon={<BellFilled />}
              title={t('noti')}
              activeMenu={activeMenu}
              windowWidth={windowWidth}
              onClick={() => setActiveMenu(2)}
              onClose={() => setActiveMenu(0)}>
              {noti}
            </MyHeaderIcon>
            <MyHeaderIcon
              key={3}
              menu={3}
              icon={<MyAvatar />}
              avatar
              title={t('account')}
              activeMenu={activeMenu}
              windowWidth={windowWidth}
              onClick={() => setActiveMenu(3)}
              onClose={() => setActiveMenu(0)}>
              {account}
            </MyHeaderIcon>
          </Space>
        </Header>
      </Affix>
      <Content className={fullWidth ? 'AppLayout__Content--full' : 'AppLayout__Content'}>
        <div className={className}>{children}</div>
      </Content>
      <MyFooter />
      <Drawer
        className='AppLayout__Drawer'
        title={t('applayout_drawer_title')}
        placement='left'
        closable
        onClose={() => setDrawerShowed(false)}
        visible={drawerShowed}>
        <Title level={5}>
          <Link to='/'>{t('/')}</Link>
        </Title>
        <Title level={5}>
          <Link to='/subjects'>{t('/subjects')}</Link>
        </Title>
        <Title level={5}>
          <Link to='/books'>{t('/books')}</Link>
        </Title>
        <Title level={5}>
          <Link to='/lectures'>{t('/lectures')}</Link>
        </Title>
        <Title level={5}>
          <Link to='/apps'>{t('/apps')}</Link>
        </Title>
        {recentLocations && recentLocations.length > 0 && (
          <Fragment>
            <Divider />
            <Title level={5}>{t('recentlocation')}</Title>
            {recentLocations.map((recent, index) => (
              <Paragraph key={index}>
                <Link to={recent.url}>{recent.name}</Link>
              </Paragraph>
            ))}
          </Fragment>
        )}
      </Drawer>
    </Layout>
  );
}
