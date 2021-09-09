import { Card, Col, Descriptions, Divider, Row, Space, Table, Typography } from 'antd';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from '../components/Center';
import { MyAvatar } from '../components/MyAvatar';
import { AuthContext } from '../ctx';
import { AppLayout } from '../layouts/AppLayout';
import './ProfilePage.less';
import firebase from 'firebase/app';
import 'firebase/database';
import { Link } from 'react-router-dom';
import moment from 'moment';

const { Column } = Table;
const { Title } = Typography;

type Device = { id: string; dev: string; datetime: number };

export function ProfilePage() {
  const [recentLocations, setRecentLocations] = useState([]);
  const [devices, setDevices] = useState([] as Device[]);

  const { auth } = useContext(AuthContext);
  const screens = useBreakpoint();
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      const db = firebase.database().ref(`users/${auth.uid}`);
      const snapshot = await db.get();
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val.recentLocations) {
          setRecentLocations(val.recentLocations);
        }
        if (val.devices) {
          const list: Device[] = [];
          for (const k in val.devices) {
            list.push({ id: k, dev: val.devices[k].dev, datetime: val.devices[k].datetime });
          }
          list.sort((a, b) => b.datetime - a.datetime);
          setDevices(list);
        }
      }
    })();
  }, []);

  return (
    <AppLayout className='ProfilePage'>
      <Center>
        <Space className='ProfilePage__Avatar' direction='horizontal' size='large'>
          <MyAvatar size={144} shape='square' />
          {screens.sm && <Title level={3}>{auth.displayName}</Title>}
        </Space>
      </Center>
      <Card>
        <Row>
          <Col xs={24}>
            <Descriptions column={1} bordered layout={screens.sm ? 'horizontal' : 'vertical'}>
              <Descriptions.Item label={t('name')}>{auth.displayName}</Descriptions.Item>
              <Descriptions.Item label={t('studentid')}>{auth.studentId || '-'}</Descriptions.Item>
              <Descriptions.Item label={t('phone')}>{auth.phoneNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label={t('uid')}>{auth.uid}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col xs={24}>
            <Table
              title={() => <Title level={4}>{t('profile_access')}</Title>}
              dataSource={recentLocations}
              rowKey='url'
              bordered>
              <Column
                title={t('location')}
                dataIndex='name'
                key='name'
                width={screens.sm ? '65%' : '100%'}
                render={(value, record: { url: string }) => <Link to={record.url}>{value}</Link>}
              />
              {screens.sm && (
                <Column
                  title={t('accessdate')}
                  dataIndex='datetime'
                  key='datetime'
                  width='35%'
                  align='center'
                  render={(value) => moment(value).format('YYYY-MM-DD HH:mm')}
                />
              )}
            </Table>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col xs={24}>
            <Table
              title={() => <Title level={4}>{t('profile_device')}</Title>}
              dataSource={devices}
              rowKey='id'
              bordered>
              <Column
                title={t('device')}
                dataIndex='dev'
                key='dev'
                ellipsis={!screens.md ? true : undefined}
                width={screens.sm ? '65%' : '100%'}
              />
              {screens.sm && (
                <Column
                  title={t('lastlogin')}
                  dataIndex='datetime'
                  key='datetime'
                  width='35%'
                  align='center'
                  render={(value) => moment(value).format('YYYY-MM-DD HH:mm')}
                />
              )}
            </Table>
          </Col>
        </Row>
      </Card>
    </AppLayout>
  );
}
