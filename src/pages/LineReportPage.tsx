import { ExportOutlined, ImportOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  List,
  message,
  Modal,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router';
import { LineReportFs, Result, Student } from '../db/LineReportFs';
import { RecentLocationDb } from '../db/RecentLocationDb';
import { AppLayout } from '../layouts/AppLayout';
import { LineReportService } from '../services/linereport';
import './LineReportPage.less';

const { Column } = Table;
const { Title, Paragraph, Link } = Typography;
const { TextArea } = Input;

export function LineReportPage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [rawData, setRawData] = useState('');
  const [data, setData] = useState({} as Result);
  const [stat, setStat] = useState([] as { group: string; title: string; value: number }[]);
  const [filter, setFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('total');
  const [appended, setAppended] = useState(true);
  const [errorVisible, setErrorVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const { subject } = useParams<{ subject: string }>();
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const location = useLocation();
  const service = useRef<LineReportService | null>(null);

  const refreshStat = (students: Student[]) => {
    if (!students || students.length === 0) {
      return;
    }
    const map = new Map<string, number>();
    students.forEach((s) => {
      const code = s.studentId.substr(0, 2);
      const count = map.get(code);
      if (!count) {
        map.set(code, 1);
      } else {
        map.set(code, count + 1);
      }
    });
    if (map.size > 0) {
      const newstat = [];
      newstat.push({ group: 'total', title: t('total'), value: students.length });
      const codes = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
      for (const code of codes) {
        newstat.push({ group: code, title: t('linereport_code', { code }), value: map.get(code) || 0 });
      }
      setStat(newstat);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const doc = await LineReportFs.getResult(subject);
        if (doc.exists()) {
          const d = doc.data() as Result;
          if (d) {
            service.current = new LineReportService(d.rawdata);
            service.current.process().then((data) => {
              setData(data);
              refreshStat(data.students);
            });
            console.log(`[linereport] get ${subject} from firestore`);
          }
        }
        console.log('[linereport] no saved data');
      } catch (error) {
        console.error(`[linereport] cannot get ${subject} from firestore:`, error);
      } finally {
        setLoading(false);
        RecentLocationDb.push(t('linereport_title', { subject: t(`/${subject}`) }), location.pathname);
      }
    })();
  }, [subject]);

  const handleCancel = () => {
    setModalVisible(false);
    setRawData('');
  };

  const handleImport = () => {
    service.current = new LineReportService(rawData, appended ? data.rawdata : undefined);
    service.current.process().then(async (data) => {
      setData(data);
      refreshStat(data.students);
      try {
        await LineReportFs.setResult(subject, data);
        console.log(`[linereport] set ${subject} to firestore`);
        message.success(t('savesuccess'));
      } catch (error) {
        console.error(`[linereport] cannot set ${subject} to firestore:`, error);
        message.error(t('savefailed'));
      }
    });
    handleCancel();
  };

  const title = (
    <Row>
      <Col xs={12} sm={16}>
        <Space>
          <Button onClick={() => setModalVisible(true)} icon={<ImportOutlined />}>
            {screens.sm && t('importdata')}
          </Button>
          <Button onClick={() => service.current?.export(subject, true)} icon={<ExportOutlined />}>
            {screens.sm && t('exporttoexcel')}
          </Button>
        </Space>
      </Col>
      <Col xs={12} sm={8}>
        <Input.Search allowClear onChange={(e) => setFilter(e.target.value.trim())} />
      </Col>
    </Row>
  );

  const datasource = () => {
    if (data.students && data.students.length > 0) {
      if (groupFilter === 'total') {
        return data.students;
      }
      return data.students.filter(({ studentId }) => studentId.startsWith(groupFilter));
    }
    return [];
  };

  return (
    <AppLayout className="LineReportPage">
      <Space direction="vertical" size="large">
        <Title level={4}>{t('linereport_title', { subject: t(`/${subject}`) })}</Title>
        <Paragraph strong>{t('linereport_desc', { subject: t(`/${subject}`) })}</Paragraph>
        {data.start && data.end && (
          <Paragraph strong>
            {t('linereport_range', {
              start: moment(data.start).format('YYYY-MM-DD HH:mm'),
              end: moment(data.end).format('YYYY-MM-DD HH:mm'),
            })}
          </Paragraph>
        )}
        <Row gutter={[16, 16]} className="LineReportPage__Stat">
          {stat.map((s) => (
            <Col
              key={s.title}
              className={groupFilter === s.group ? 'LineReportPage__Stat--selected' : ''}
              xs={8}
              md={6}
              lg={4}
              onClick={() => setGroupFilter(s.group)}>
              <Card>
                <Statistic title={s.title} value={s.value} />
                <Progress percent={(s.value / data.students.length) * 100} showInfo={false} />
              </Card>
            </Col>
          ))}
        </Row>
        <Table
          dataSource={datasource().filter(({ lineId, studentId, name }) =>
            filter ? lineId.indexOf(filter) >= 0 || name.indexOf(filter) >= 0 || studentId.indexOf(filter) >= 0 : true
          )}
          title={() => title}
          bordered
          rowKey="lineId"
          scroll={{ x: 950 }}
          loading={loading}
          footer={() => (
            <Space size="large">
              <Link onClick={() => data.errors?.length > 0 && setErrorVisible(true)}>
                {t('founderror', { count: data.errors?.length || 0 })}
              </Link>
              {screens.sm && (
                <Link onClick={() => service.current?.saveAsRaw(subject)}>{t('linereport_download')}</Link>
              )}
            </Space>
          )}>
          <Column
            title={t('line')}
            dataIndex="lineId"
            key="lineId"
            sorter={(a: Student, b: Student) => a.lineId.localeCompare(b.lineId)}
            fixed="left"
            width={200}
          />
          <Column
            title={t('studentid')}
            dataIndex="studentId"
            key="studentId"
            sorter={(a: Student, b: Student) => a.studentId.localeCompare(b.studentId)}
            align="center"
            width="30%"
          />
          <Column
            title={t('name')}
            dataIndex="name"
            key="name"
            sorter={(a: Student, b: Student) => a.name.localeCompare(b.name)}
            width="40%"
          />
          <Column
            title={t('reportdate')}
            dataIndex="datetime"
            key="datetime"
            align="center"
            sorter={(a: Student, b: Student) => a.timestamp.localeCompare(b.timestamp)}
            render={(_, record) => (
              <Tooltip title={record.msg}>{moment(record.timestamp).format('YYYY-MM-DD HH:mm')}</Tooltip>
            )}
            width="30%"
          />
        </Table>
      </Space>
      <Modal
        title={t('founderror', { count: data.errors?.length || 0 })}
        visible={errorVisible}
        onCancel={() => setErrorVisible(false)}
        footer={
          <Button type="primary" onClick={() => setErrorVisible(false)}>
            {t('close')}
          </Button>
        }
        width={screens.md ? 1000 : 520}>
        <div className="LineReportPage__List">
          <List
            itemLayout="vertical"
            dataSource={data.errors}
            split={false}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta title={item.msg} description={item.timestamp} />
              </List.Item>
            )}
          />
        </div>
      </Modal>
      <Modal
        title={t('linereport_paste')}
        visible={modalVisible}
        onOk={handleImport}
        onCancel={handleCancel}
        width={screens.md ? 1000 : 520}>
        <Row gutter={[0, 15]}>
          <Col xs={24}>
            <TextArea
              rows={10}
              spellCheck="false"
              autoCapitalize="false"
              autoComplete="false"
              autoCorrect="false"
              autoSave="false"
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
            />
          </Col>
          <Col xs={24}>
            <Checkbox onChange={(e) => setAppended(e.target.checked)} checked={appended}>
              {t('linereport_append')}
            </Checkbox>
          </Col>
        </Row>
      </Modal>
    </AppLayout>
  );
}
