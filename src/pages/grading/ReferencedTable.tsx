import { CheckOutlined } from '@ant-design/icons';
import { Button, Table } from 'antd';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import { PropsWithoutRef } from 'react';
import { ReferencedRow } from '../../services/grading';
import { numberFormat } from '../../util';

const { Column } = Table;

export function ReferencedTable({
  table,
  grade = false,
  onUse,
}: PropsWithoutRef<{ table: ReferencedRow[]; grade?: boolean; onUse?: () => void }>) {
  const screens = useBreakpoint();

  const fc: JSX.Element[] = [];
  if (screens.sm) {
    fc.push(
      <Column
        key='fcmax'
        title='ความถี่สะสม Min-Max'
        align='center'
        width='20%'
        render={(_, record: ReferencedRow) =>
          numberFormat(
            table.filter((r) => r.min >= record.min).reduce((previous, current) => previous + current.count, 0)
          )
        }
      />
    );
    fc.push(
      <Column
        key='fcmin'
        title='ความถี่สะสม Max-Min'
        align='center'
        width='20%'
        render={(_, record: ReferencedRow) =>
          numberFormat(
            table.filter((r) => r.max <= record.max).reduce((previous, current) => previous + current.count, 0)
          )
        }
      />
    );
  }

  return (
    <Table
      dataSource={table}
      rowKey='row'
      title={
        onUse
          ? () => (
              <Button icon={<CheckOutlined />} onClick={() => onUse && onUse()}>
                {screens.sm && 'ใช้ค่าจากตารางนี้'}
              </Button>
            )
          : undefined
      }
      bordered
      pagination={{ defaultPageSize: 20, hideOnSinglePage: true }}>
      <Column dataIndex='row' key='row' title={grade ? 'เกรด' : 'ช่วงคะแนน'} align='center' width='20%' />
      <Column
        key='range'
        title={grade ? 'ช่วงคะแนน' : 'ความกว้าง'}
        align='center'
        width='20%'
        render={(_, record: ReferencedRow) => (grade ? `${record.max} - ${record.min}` : record.max - record.min + 1)}
      />
      <Column
        dataIndex='count'
        title='ความถี่'
        key='f'
        align='center'
        width='20%'
        render={(value) => numberFormat(value)}
      />
      {fc}
    </Table>
  );
}
