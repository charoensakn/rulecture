import { onValue } from '@firebase/database';
import { Card, Col, Descriptions, Divider, Row, Space, Table, Typography } from 'antd';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Center } from '../components/Center';
import { MyAvatar } from '../components/MyAvatar';
import { AuthContext } from '../contexts/auth';
import { Database } from '../db/Database';
import { AppLayout } from '../layouts/AppLayout';
import { flatObject } from '../util';
import './ProfilePage.less';

const { Column } = Table;
const { Title } = Typography;

type Device = { id: string; dev: string; datetime: number };

export function ProfilePage() {
  const [recentLocations, setRecentLocations] = useState([]);
  const [devices, setDevices] = useState([] as Device[]);

  const screens = useBreakpoint();
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      const db = Database.usersRef();
      if (db) {
        onValue(
          db,
          (snapshot) => {
            if (snapshot.exists()) {
              const val = snapshot.val();
              if (val.recentLocations) {
                setRecentLocations(val.recentLocations);
              }
              if (val.devices) {
                setDevices(
                  flatObject(val.devices).sort(
                    (a: { datetime: number }, b: { datetime: number }) => b.datetime - a.datetime
                  )
                );
              }
            }
          },
          { onlyOnce: true }
        );
      }
    })();
  }, []);

  return (
    <AppLayout className="ProfilePage">
      <Center>
        <AuthContext.Consumer>
          {({ authUser }) => (
            <Space className="ProfilePage__Avatar" direction="horizontal" size="large">
              <MyAvatar size={144} shape="square" />
              {screens.sm && <Title level={3}>{authUser.displayName}</Title>}
            </Space>
          )}
        </AuthContext.Consumer>
      </Center>
      <Card>
        <Row>
          <Col xs={24}>
            <AuthContext.Consumer>
              {({ authUser }) => (
                <Descriptions column={1} bordered layout={screens.sm ? 'horizontal' : 'vertical'}>
                  <Descriptions.Item label={t('name')}>{authUser.displayName}</Descriptions.Item>
                  <Descriptions.Item label={t('studentid')}>{authUser.studentId || '-'}</Descriptions.Item>
                  <Descriptions.Item label={t('phone')}>{authUser.phoneNumber || '-'}</Descriptions.Item>
                  <Descriptions.Item label={t('uid')}>{authUser.uid}</Descriptions.Item>
                </Descriptions>
              )}
            </AuthContext.Consumer>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col xs={24}>
            <Table
              title={() => <Title level={4}>{t('profile_access')}</Title>}
              dataSource={recentLocations}
              rowKey="url"
              bordered>
              <Column
                title={t('location')}
                dataIndex="name"
                key="name"
                width={screens.sm ? '65%' : '100%'}
                render={(value, record: { url: string }) => <Link to={record.url}>{value}</Link>}
              />
              {screens.sm && (
                <Column
                  title={t('accessdate')}
                  dataIndex="datetime"
                  key="datetime"
                  width="35%"
                  align="center"
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
              rowKey="key"
              bordered>
              <Column
                title={t('device')}
                dataIndex="dev"
                key="dev"
                ellipsis={!screens.md ? true : undefined}
                width={screens.sm ? '65%' : '100%'}
              />
              {screens.sm && (
                <Column
                  title={t('lastlogin')}
                  dataIndex="datetime"
                  key="datetime"
                  width="35%"
                  align="center"
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
