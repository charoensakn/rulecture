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
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/firestore';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useLocation, useParams } from 'react-router';
import { lineReportDb } from '../db/LineReportDb';
import { recentLocationDb } from '../db/RecentLocationDb';
import { AppLayout } from '../layouts/AppLayout';
import { LineReportService, Result, Student } from '../services/linereport';
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

  if (t(`/${subject}`) === `/${subject}`) {
    return <Redirect to='/pagenotfound' />;
  }

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
        const doc = await lineReportDb.getResult(subject);
        if (doc.exists()) {
          const d = doc.data() as Result;
          if (d) {
            setData(d);
            console.log(`[linereport] get ${subject} from firestore`);
            refreshStat(d.students);
            return;
          }
        }
        console.log('[linereport] no saved data');
      } catch (error) {
        console.error(`[linereport] cannot get ${subject} from firestore:`, error);
      } finally {
        setLoading(false);
        recentLocationDb.push(t('linereport_title', { subject: t(`/${subject}`) }), location.pathname);
      }
    })();
  }, [subject]);

  const handleCancel = () => {
    setModalVisible(false);
    setRawData('');
  };

  const handleImport = () => {
    const service = new LineReportService(rawData, appended ? data.rawdata : undefined);
    service.process().then(async (data) => {
      setData(data);
      refreshStat(data.students);
      try {
        await lineReportDb.setResult(subject, data);
        console.log(`[linereport] set ${subject} to firestore`);
        message.success(t('savesuccess'));
      } catch (error) {
        console.error(`[linereport] cannot set ${subject} to firestore:`, error);
        message.error(t('savefailed'));
      }
    });
    handleCancel();
  };

  const handleExport = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(subject);
    sheet.columns = [
      { key: 'line', header: t('line'), width: 30, alignment: { vertical: 'middle', horizontal: 'left' } },
      { key: 'studentid', header: t('studentid'), width: 20, alignment: { vertical: 'middle', horizontal: 'center' } },
      { key: 'name', header: t('name'), width: 40, alignment: { vertical: 'middle', horizontal: 'left' } },
      {
        key: 'reportdate',
        header: t('reportdate'),
        width: 40,
        alignment: { vertical: 'middle', horizontal: 'center' },
      },
    ];
    sheet.getRow(1).height = 20;
    for (let i = 0; i < data.students.length; i++) {
      const d = data.students[i];
      if (d) {
        const row = sheet.getRow(i + 2);
        row.height = 20;
        row.values = {
          line: d.lineId,
          studentid: d.studentId,
          name: d.name,
          reportdate: d.datetime,
        };
      }
    }
    for (const i of ['A', 'B', 'C', 'D']) {
      const cell = sheet.getCell(`${i}1`);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
    for (let j = 0; j < data.students.length; j++) {
      for (const i of ['A', 'B', 'C', 'D']) {
        const cell = sheet.getCell(`${i}${j + 2}`);
        if (j === data.students.length - 1) {
          cell.border = {
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        } else {
          cell.border = {
            left: { style: 'thin' },
            right: { style: 'thin' },
          };
        }
      }
    }
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `linereport-${subject}_${moment().format('YYYYMMDDHHmm')}.xlsx`
      );
    });
  };

  const title = (
    <Row>
      <Col xs={12} sm={16}>
        <Space>
          <Button onClick={() => setModalVisible(true)} icon={<ImportOutlined />}>
            {screens.sm && t('importdata')}
          </Button>
          <Button onClick={handleExport} icon={<ExportOutlined />}>
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
    <AppLayout className='LineReportPage'>
      <Space direction='vertical' size='large'>
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
        <Row gutter={[16, 16]} className='LineReportPage__Stat'>
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
          rowKey='lineId'
          scroll={{ x: 950 }}
          loading={loading}
          footer={() => (
            <Space size='large'>
              <Link onClick={() => data.errors?.length > 0 && setErrorVisible(true)}>
                {t('founderror', { count: data.errors?.length || 0 })}
              </Link>
              {screens.sm && (
                <Link
                  onClick={() =>
                    data.rawdata?.length > 0 &&
                    saveAs(
                      new Blob([data.rawdata], { type: 'text/plain' }),
                      `linereport-${subject}_${moment().format('YYYYMMDDHHmm')}.txt`
                    )
                  }>
                  {t('linereport_download')}
                </Link>
              )}
            </Space>
          )}>
          <Column
            title={t('line')}
            dataIndex='lineId'
            key='lineId'
            sorter={(a: Student, b: Student) => a.lineId.localeCompare(b.lineId)}
            fixed='left'
            width={200}
          />
          <Column
            title={t('studentid')}
            dataIndex='studentId'
            key='studentId'
            sorter={(a: Student, b: Student) => a.studentId.localeCompare(b.studentId)}
            align='center'
            width='30%'
          />
          <Column
            title={t('name')}
            dataIndex='name'
            key='name'
            sorter={(a: Student, b: Student) => a.name.localeCompare(b.name)}
            width='40%'
          />
          <Column
            title={t('reportdate')}
            dataIndex='datetime'
            key='datetime'
            align='center'
            sorter={(a: Student, b: Student) => a.datetime.localeCompare(b.datetime)}
            render={(_, record) => (
              <Tooltip title={record.msg}>{moment(record.datetime).format('YYYY-MM-DD HH:mm')}</Tooltip>
            )}
            width='30%'
          />
        </Table>
      </Space>
      <Modal
        title={t('founderror', { count: data.errors?.length || 0 })}
        visible={errorVisible}
        onCancel={() => setErrorVisible(false)}
        footer={
          <Button type='primary' onClick={() => setErrorVisible(false)}>
            {t('close')}
          </Button>
        }
        width={screens.md ? 1000 : 520}>
        <div className='LineReportPage__List'>
          <List
            itemLayout='vertical'
            dataSource={data.errors}
            split={false}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta title={item.msg} description={item.datetime} />
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
              spellCheck='false'
              autoCapitalize='false'
              autoComplete='false'
              autoCorrect='false'
              autoSave='false'
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
