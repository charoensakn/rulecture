import { EditOutlined, RedoOutlined } from '@ant-design/icons';
import { Button, Card, Col, Descriptions, Form, Input, Popover, Row, Space, Table, Typography } from 'antd';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import { Fragment, PropsWithoutRef, useState } from 'react';
import { ScrollToTop } from '../../components/ScrollToTop';
import { ReferencedRow } from '../../services/grading';
import { numberFormat } from '../../util';
import { ReferencedTable } from './ReferencedTable';

export type Stat = {
  oldscore: number;
  maxscore: number;
  coefficient: number;
  min: number;
  max: number;
  range: number;
  mean: number;
  median: number;
  mode: number;
  sd: number;
  variance: number;
  freqReferencedTable: ReferencedRow[];
  normReferencedTable: ReferencedRow[];
  criterianReferencedTable: ReferencedRow[];
};

const { Column } = Table;
const { Title, Text } = Typography;

export function Step3({
  stat,
  myTable,
  onMaxScore,
  onMinChange,
  onMaxChange,
  onUseNorm,
  onUseCriterian,
  onApplyGrade,
}: PropsWithoutRef<{
  stat: Stat;
  myTable: ReferencedRow[];
  onMaxScore: (maxScore?: number) => void;
  onMinChange: (index: number, min: number) => void;
  onMaxChange: (index: number, max: number) => void;
  onUseNorm: () => void;
  onUseCriterian: () => void;
  onApplyGrade: () => void;
}>) {
  const [maxScore, setMaxScore] = useState(stat.maxscore);
  const [maxScoreVisible, setMaxScoreVisible] = useState(false);

  const screens = useBreakpoint();

  return (
    <Row gutter={[0, 15]}>
      <ScrollToTop />
      <Col xs={24}>
        <Title level={4}>ตารางแจกแจงความถี่</Title>
      </Col>
      <Col xs={24}>
        <ReferencedTable table={stat.freqReferencedTable} />
      </Col>
      <Col xs={24}>
        <Title level={4}>ค่าสถิติที่เกี่ยวข้อง</Title>
      </Col>
      <Col xs={24}>
        <Card>
          <Descriptions className='GradingPage__StatDesc' bordered column={{ xs: 1, sm: 1, md: 1, lg: 2 }}>
            <Descriptions.Item key='maxscore' label='maxscore'>
              <Space size='large'>
                <Text>{stat.maxscore}</Text>
                <Popover
                  content={
                    <Form labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}>
                      <Form.Item label='ค่าคะแนนสูงสุดเริ่มต้น'>
                        <Input type='number' readOnly value={stat.oldscore} />
                      </Form.Item>
                      <Form.Item label='ค่าคะแนนสูงสุดก่อนหน้า'>
                        <Input type='number' readOnly value={stat.maxscore} />
                      </Form.Item>
                      <Form.Item label='ค่าคะแนนสูงสุดใหม่'>
                        <Input type='number' onChange={(e) => setMaxScore(parseInt(e.target.value))} />
                      </Form.Item>
                      <Form.Item wrapperCol={{ offset: screens.sm ? 12 : 0, span: 12 }}>
                        <Space>
                          <Button onClick={() => setMaxScoreVisible(false)}>ยกเลิก</Button>
                          <Button
                            type='primary'
                            onClick={() => {
                              onMaxScore(maxScore);
                              setMaxScoreVisible(false);
                            }}>
                            ยืนยัน
                          </Button>
                        </Space>
                      </Form.Item>
                    </Form>
                  }
                  trigger='click'
                  visible={maxScoreVisible}>
                  <Button icon={<EditOutlined />} onClick={() => setMaxScoreVisible(true)}>
                    {screens.sm && 'ตั้งค่าใหม่'}
                  </Button>
                </Popover>
              </Space>
            </Descriptions.Item>
            {['coefficient', 'max', 'min', 'range', 'mean', 'median', 'mode', 'sd', 'variance'].map((k) => (
              <Descriptions.Item key={k} label={k}>
                {numberFormat((stat as any)[k])}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      </Col>
      <Col xs={24}>
        <Title level={4}>ตารางเกรดแบบอิงกลุ่ม</Title>
      </Col>
      <Col xs={24}>
        <ReferencedTable table={stat.normReferencedTable} grade onUse={onUseNorm} />
      </Col>
      <Col xs={24}>
        <Title level={4}>ตารางเกรดแบบอิงเกณฑ์</Title>
      </Col>
      <Col xs={24}>
        <ReferencedTable table={stat.criterianReferencedTable} grade onUse={onUseCriterian} />
      </Col>
      <Col xs={24}>
        <Title level={4}>ตารางเกรด</Title>
      </Col>
      <Col xs={24}>
        <Table
          className='GradingPage__GradeTable'
          dataSource={myTable}
          rowKey='row'
          bordered
          title={() => (
            <Button icon={<RedoOutlined />} onClick={() => onApplyGrade()}>
              {screens.sm && 'คำนวณค่าความถี่ใหม่'}
            </Button>
          )}
          pagination={{ defaultPageSize: 20, hideOnSinglePage: true }}>
          <Column dataIndex='row' key='row' title='เกรด' align='center' width='20%' />
          <Column
            dataIndex='max'
            title='คะแนนขั้นสูง'
            key='max'
            align='center'
            width='20%'
            render={(value, _, index) => (
              <Input
                type='number'
                value={value}
                onChange={(e) => {
                  const val = parseInt(e.target.value || '0');
                  onMaxChange(index, val);
                  onMinChange(index - 1, val + 1);
                }}
              />
            )}
          />
          <Column
            dataIndex='min'
            title='คะแนนขั้นต่ำ'
            key='min'
            align='center'
            width='20%'
            render={(value, _, index) => (
              <Input
                type='number'
                value={value}
                onChange={(e) => {
                  const val = parseInt(e.target.value || '0');
                  onMinChange(index, val);
                  onMaxChange(index + 1, val - 1);
                }}
              />
            )}
          />
          {screens.sm && (
            <Fragment>
              <Column
                key='width'
                title='ความกว้าง'
                align='center'
                width='20%'
                render={(_, record: ReferencedRow) => record.max - record.min + 1}
              />
              <Column
                dataIndex='count'
                title='ความถี่'
                key='f'
                align='center'
                width='20%'
                render={(value) => numberFormat(value)}
              />
            </Fragment>
          )}
        </Table>
      </Col>
    </Row>
  );
}
