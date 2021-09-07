import { Card, Col, Descriptions, Divider, Row, Space, Table, Typography } from 'antd';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from '../components/Center';
import { MyAvatar } from '../components/MyAvatar';
import { AuthContext } from '../ctx';
import { AppLayout } from '../layouts/AppLayout';
import './ProfilePage.less';

const { Column } = Table;
const { Title } = Typography;

export function ProfilePage() {
  const { auth } = useContext(AuthContext);
  const screens = useBreakpoint();
  const { t } = useTranslation();

  const devDatasource: any = [];

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
              title={() => <h2>{t('profile_access')}</h2>}
              dataSource={devDatasource}
              bordered
              rowSelection={{ type: 'checkbox', getCheckboxProps: (record) => ({ id: record.id }) }}
            >
              <Column title={t('location')} dataIndex='path' key='path' width={screens.sm ? '70%' : '100%'} />
              {screens.sm && <Column title={t('accessdate')} dataIndex='date' key='date' width='30%' align='center' />}
            </Table>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col xs={24}>
            <Table
              title={() => <h2>{t('profile_device')}</h2>}
              dataSource={devDatasource}
              bordered
              rowSelection={{ type: 'checkbox', getCheckboxProps: (record) => ({ id: record.id }) }}
            >
              <Column
                title={t('device')}
                dataIndex='name'
                key='name'
                ellipsis={!screens.sm ? true : undefined}
                width={screens.sm ? '70%' : '100%'}
              />
              {screens.sm && (
                <Column title={t('lastlogin')} dataIndex='datetime' key='datetime' width='30%' align='center' />
              )}
            </Table>
          </Col>
        </Row>
      </Card>
    </AppLayout>
  );
}
