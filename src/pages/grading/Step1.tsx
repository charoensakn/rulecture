import { CloseOutlined, FileAddTwoTone, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Space, Table, Typography, Upload } from 'antd';
import { PropsWithoutRef } from 'react';
import { ScrollToTop } from '../../components/ScrollToTop';
import { Key, KeyType } from '../../services/grading';

const { Paragraph, Title, Text } = Typography;

export function Step1({
  keys,
  onFile,
  onKeyChange,
}: PropsWithoutRef<{
  keys: Key[];
  onFile: (input: string) => void;
  onKeyChange: (k: string, type: KeyType) => void;
}>) {
  return (
    <Row gutter={[0, 15]}>
      <ScrollToTop />
      <Col xs={24}>
        <Paragraph strong>
          โปรแกรมฯ นี้ได้ไอเดียมาจากการทำข้อสอบผ่าน Google Form ซึ่งพบว่าบางวิชามีชุดคำถามหลายชุด
          บางวิชามีชุดคำถามเดียวแต่มีจำนวนข้อมาก ทำให้การตรวจข้อสอบรายบุคคลค่อนข้างจะยุ่งยาก เนื่องจากไฟล์ผลลัพธ์จาก
          Google Form (ไฟล์การตอบกลับ.csv) มีขนาดใหญ่จากความซ้ำซ้อนของข้อมูล
          เพื่ออำนวยความสะดวกและแก้ปัญหาด้งกล่าวโปรแกรมนี้จึงถูกพัฒนาขึ้น
          โดยโปรแกรมจะทำการคำนวณคะแนนด้วยการเปรียบเทียบไฟล์เฉลยกับไฟล์คำตอบ
          และสร้างสถิติของคะแนนรวมถึงการคำนวณช่วงของคะแนนแบบอิงกลุ่มและอิงเกณฑ์ เพื่อเป็นแนวทางในการตัดเกรดต่อไป
        </Paragraph>
        <Paragraph strong>
          เพื่อรักษาข้อมูลส่วนบุคคล โปรแกรมจะไม่ทำการบันทึกหรืออัพโหลดข้อมูลใดๆ
          ไปยังระบบฐานข้อมูลหรือระบบอื่นใดที่เกี่ยวข้อง
          โดยโปรแกรมนี้จะทำงานและประมวลผลด้วยเบราว์เซอร์ของผู้ใช้งานเพียงอย่างเดียวเท่านั้น
          ผู้ใช้งานสามารถปิดระบบอินเตอร์เน็ตหรือเปิดระบบออฟไลน์ระหว่างที่ใช้งานโปรแกรมนี้ได้
          การวางไฟล์หรืออัพโหลดไฟล์ของโปรแกรมนี้เป็นการใช้งานโมดูล File API
          โดยตัวโมดูลจะทำการอ่านข้อมูลไฟล์เพื่อนำไปประมวลผลเท่านั้น
        </Paragraph>
      </Col>
      <Col xs={24}>
        <Upload.Dragger
          className='GradingPage__Upload'
          accept='.csv'
          multiple
          showUploadList={false}
          beforeUpload={(file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const input = e.target?.result as string;
              if (input) {
                onFile(input);
              }
            };
            reader.readAsText(file);
          }}>
          <Title level={1}>
            <FileAddTwoTone />
          </Title>
          <Title level={5}>คลิกหรือลากไฟล์เฉลยมาวางที่นี่</Title>
          <Paragraph>
            ไฟล์เฉลยเป็นไฟล์ csv ที่สามารถสร้างได้จากการตอบกลับ Google Form โดยโปรแกรมจะทำการอ่านข้อมูลเพียง 2
            บรรทัดแรกเท่านั้น คือ คำถามในบรรทัดแรกและคำตอบในบรรทัดที่สอง ผู้ใช้สามารถวางไฟล์เฉลยกี่ไฟล์ก็ได้
            โปรแกรมจะทำการรวมไฟล์เฉลยทั้งหมดเข้าไว้ด้วยกัน โดยยึดเฉลยของไฟล์ที่วางล่าสุดหากมีคำถามซ้ำ
          </Paragraph>
        </Upload.Dragger>
      </Col>
      {keys.length > 0 && (
        <Col xs={24}>
          <Table
            dataSource={keys}
            bordered
            rowKey='k'
            rowClassName={(k) => (k.t === KeyType.UNUSED ? 'GradingPage__RowKey--unused' : '')}
            rowSelection={{
              selectedRowKeys: keys.filter((k) => k.t === KeyType.PRIMARY).map((k) => k.k),
              onSelect: (record) => {
                onKeyChange(record.k, record.t === KeyType.PRIMARY ? KeyType.QUESTION : KeyType.PRIMARY);
              },
            }}
            title={() => <Text>กรุณาเลือกฟิลด์หลักที่ใช้ในการเชื่อมข้อมูลและลบฟิลด์ที่ไม่จำเป็นออก</Text>}
            footer={() => {
              const plen = keys.filter((k) => k.t === KeyType.PRIMARY).length;
              const qlen = keys.filter((k) => k.t === KeyType.QUESTION).length;
              const ulen = keys.filter((k) => k.t === KeyType.UNUSED).length;
              return (
                <Space direction='vertical'>
                  <Text>จำนวนฟิลด์ทั้งหมด {keys.length} ฟิลด์ ประกอบด้วย</Text>
                  <ul className='GradingPage__FieldList'>
                    {!!plen && (
                      <li>
                        <Text>ฟิลด์หลักสำหรับเชื่อมข้อมูล {plen} ฟิลด์</Text>
                      </li>
                    )}
                    {!!qlen && (
                      <li>
                        <Text>ฟิลด์คำถาม {qlen} ฟิลด์</Text>
                      </li>
                    )}
                    {!!ulen && (
                      <li>
                        <Text>ฟิลด์ที่ไม่จำเป็น {ulen} ฟิลด์</Text>
                      </li>
                    )}
                  </ul>
                </Space>
              );
            }}>
            <Table.Column
              dataIndex='k'
              key='k'
              title='คำถาม'
              ellipsis
              width='40%'
              render={(value, record: Key) => <Text delete={record.t === KeyType.UNUSED}>{value}</Text>}
            />
            <Table.Column
              dataIndex='v'
              key='v'
              title='คำตอบ'
              ellipsis
              width='40%'
              render={(value, record: Key) => <Text delete={record.t === KeyType.UNUSED}>{value}</Text>}
            />
            <Table.Column
              key='action'
              width='20%'
              align='center'
              render={(_, record: Key) => (
                <Button
                  shape='circle'
                  size='small'
                  icon={record.t !== KeyType.UNUSED ? <CloseOutlined /> : <PlusOutlined />}
                  onClick={() => {
                    onKeyChange(record.k, record.t === KeyType.UNUSED ? KeyType.QUESTION : KeyType.UNUSED);
                  }}
                />
              )}
            />
          </Table>
        </Col>
      )}
    </Row>
  );
}
