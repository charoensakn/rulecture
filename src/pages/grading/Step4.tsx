import { ExportOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Table, Typography } from 'antd';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import { PropsWithoutRef, useState } from 'react';
import { ScrollToTop } from '../../components/ScrollToTop';
import { Answer, ReferencedRow } from '../../services/grading';
import { ReferencedTable } from './ReferencedTable';

const { Title } = Typography;
const { Column } = Table;

export function Step4({
  refTable,
  answers,
  onSave,
}: PropsWithoutRef<{ refTable: ReferencedRow[]; answers: Answer[]; onSave: () => void }>) {
  const [filter, setFilter] = useState('');

  const screens = useBreakpoint();

  const title = (
    <Row>
      <Col xs={12} sm={16}>
        <Button onClick={onSave} icon={<ExportOutlined />}>
          {screens.sm && 'ดาว์นโหลดข้อมูล'}
        </Button>
      </Col>
      <Col xs={12} sm={8}>
        <Input.Search allowClear onChange={(e) => setFilter(e.target.value.trim())} />
      </Col>
    </Row>
  );

  return (
    <Row gutter={[0, 15]}>
      <ScrollToTop />
      <Col xs={24}>
        <Title level={4}>ตารางเกรด</Title>
      </Col>
      <Col xs={24}>
        <ReferencedTable table={refTable} grade />
      </Col>
      <Col xs={24}>
        <Title level={4}>ตารางผลคะแนน</Title>
      </Col>
      <Col xs={24}>
        <Table
          dataSource={answers.filter((value) => (filter ? value.k.indexOf(filter) >= 0 : true))}
          rowKey='k'
          bordered
          title={() => title}>
          <Column key='k' dataIndex='k' title='คีย์เชื่อมโยง' width='40%' ellipsis />
          <Column key='score' dataIndex='score' title='คะแนนก่อนปรับ' width='20%' align='center' />
          <Column key='coescore' dataIndex='coescore' title='คะแนนหลังปรับ' width='20%' align='center' />
          <Column key='grade' dataIndex='grade' title='เกรดที่ได้' width='20%' align='center' />
        </Table>
      </Col>
    </Row>
  );
}
