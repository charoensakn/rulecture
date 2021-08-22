import {
  BellFilled,
  BellOutlined,
  HomeFilled,
  HomeOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  MenuOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Affix, Breadcrumb, Divider, Drawer, Layout, Menu, Popover, Space } from 'antd';
import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MyAvatar } from '../components/MyAvatar';
import { AuthContext } from '../ctx';
import './AppLayout.less';

const { Header, Footer, Content } = Layout;
const { Item } = Menu;

export function AppLayout({ className, children }: PropsWithChildren<{ className?: string }>) {
  const [homeSelected, setHomeSelected] = useState(false);
  const [bellSelected, setBellSelected] = useState(false);
  const [drawerShowed, setDrawerShowed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const { auth } = useContext(AuthContext);
  const { t } = useTranslation();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const information = <div className='AppLayout__Information'>ยังไม่มีข้อมูล ณ ขณะนี้</div>;
  const notification = <div className='AppLayout__PopoverMenu'>ยังไม่มีข้อความใหม่</div>;

  const avatarMenu = (
    <div className='AppLayout__PopoverMenu'>
      <p>
        <strong>{auth.displayName}</strong>
      </p>
      <p>{auth.email}</p>
      <Divider />
      <Menu>
        <Item key='profile' icon={<UserOutlined />}>
          <Link to='/profile'>โปรไฟล์</Link>
        </Item>
        <Item key='setting' icon={<SettingOutlined />}>
          <Link to='/setting'>ตั้งค่าแอปพลิเคชัน</Link>
        </Item>
      </Menu>
      <Divider />
      <Menu>
        <Item key='logout' icon={<LogoutOutlined />}>
          <Link to='/logout'>ออกจากระบบ</Link>
        </Item>
      </Menu>
    </div>
  );

  return (
    <Layout className='AppLayout'>
      <Affix>
        <Header className='AppLayout__Header'>
          <Space size='small'>
            <MenuOutlined className='AppLayout__Button' onClick={() => setDrawerShowed(true)} />
            <Link to='/'>
              {homeSelected ? (
                <HomeFilled className='AppLayout__Button' onMouseLeave={() => setHomeSelected(false)} />
              ) : (
                <HomeOutlined className='AppLayout__Button' onMouseEnter={() => setHomeSelected(true)} />
              )}
            </Link>
            <Breadcrumb>{links}</Breadcrumb>
          </Space>
          <div className='AppLayout__Fill'></div>
          <Space size='small'>
            <Popover placement='bottomRight' title='ข้อมูลแอป' content={information} trigger='click'>
              <span className='AppLayout__Popover'>
                <InfoCircleOutlined className='AppLayout__Button' />
              </span>
            </Popover>
            <Popover placement='bottomRight' title='แจ้งเตือน' content={notification} trigger='click'>
              <span className='AppLayout__Popover'>
                {bellSelected ? (
                  <BellFilled className='AppLayout__Button' onMouseLeave={() => setBellSelected(false)} />
                ) : (
                  <BellOutlined className='AppLayout__Button' onMouseEnter={() => setBellSelected(true)} />
                )}
              </span>
            </Popover>
            <Popover content={avatarMenu} title='ข้อมูลผู้ใช้งาน' placement='bottomRight' trigger='click'>
              <span className='AppLayout__Popover'>
                <MyAvatar />
              </span>
            </Popover>
          </Space>
        </Header>
      </Affix>
      <Content className='AppLayout__Content'>
        <div className={className}>{children}</div>
      </Content>
      <Footer>
        <div className='AppLayout__Footer'>แอปพลิเคชันนี้สำหรับการใช้งานส่วนบุคคลเท่านั้น</div>
      </Footer>
      <Drawer title='เมนูลัด' placement='left' closable onClose={() => setDrawerShowed(false)} visible={drawerShowed}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </Layout>
  );
}
