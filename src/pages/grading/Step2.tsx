import { FileAddTwoTone } from '@ant-design/icons';
import { Card, Col, Descriptions, Row, Space, Typography, Upload } from 'antd';
import { PropsWithoutRef } from 'react';
import { ScrollToTop } from '../../components/ScrollToTop';
import { numberFormat } from '../../util';

const { Paragraph, Title, Text } = Typography;

export type FileStatus = {
  name: string;
  input: string;
  size: number;
  loaded: boolean;
  loading: boolean;
  error?: string;
};

export function Step2({
  fileList,
  onFile,
}: PropsWithoutRef<{ fileList: FileStatus[]; onFile: (file: FileStatus) => void }>) {
  return (
    <Row gutter={[15, 15]}>
      <ScrollToTop />
      <Col xs={24}>
        <Upload.Dragger
          className='GradingPage__Upload'
          accept='.csv'
          multiple
          showUploadList={false}
          beforeUpload={(file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target) {
                const input = e.target.result as string;
                onFile({
                  name: file.name,
                  size: file.size,
                  loaded: false,
                  loading: false,
                  input,
                });
              }
            };
            reader.readAsText(file);
          }}>
          <Title level={1}>
            <FileAddTwoTone />
          </Title>
          <Title level={5}>คลิกหรือลากไฟล์คำตอบมาวางที่นี่</Title>
          <Paragraph>
            ไฟล์คำตอบเป็นไฟล์ csv ที่สามารถดาวน์โหลดได้จากเมนูการตอบกลับใน Google Form
            เมื่อวางไฟล์แล้วโปรแกรมจะทำการประมวลผลเพื่อคำนวณหาค่าคะแนนจากคำตอบของแต่ละคน
            ผู้ใช้สามารถวางไฟล์หลายไฟล์พร้อมกันได้
            โดยโปรแกรมจะทำการประมวลผลทีละหนึ่งไฟล์ตามลำดับจนครบตามจำนวนไฟล์ทั้งหมด
            ให้ผู้ใช้รอจนกว่าสถานะการนำเข้าไฟล์เสร็จสิ้นจนครบทุกไฟล์ แล้วจึงดำเนินการในขั้นตอนต่อไป
          </Paragraph>
        </Upload.Dragger>
      </Col>
      {fileList.map((file, index) => (
        <Col key={index} xs={24} lg={12}>
          <Card
            className={
              file.loaded
                ? file.error
                  ? 'GradingPage__File--error'
                  : 'GradingPage__File--success'
                : file.loading
                ? 'GradingPage__File--loading'
                : ''
            }>
            <Descriptions className='GradingPage__FileDesc' bordered column={1}>
              <Descriptions.Item key='name' label='ชื่อไฟล์'>
                {file.name}
              </Descriptions.Item>
              <Descriptions.Item key='size' label='ขนาด'>
                {numberFormat(file.size > 1024 ? file.size / 1024 : file.size, 0) + (file.size > 1024 ? ' KB' : ' B')}
              </Descriptions.Item>
              <Descriptions.Item key='status' label='สถานะ'>
                {file.loaded
                  ? file.error
                    ? file.error
                    : 'เสร็จสิ้นการนำเข้าข้อมูล'
                  : file.loading
                  ? 'กำลังนำเข้าข้อมูล'
                  : 'รอนำเข้าข้อมูล'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
