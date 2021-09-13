import fs from 'fs';
import 'jest';
import path from 'path';
import { LineReportService } from './linereport';

const rawdata1 = fs.readFileSync(path.join(__dirname, 'linereport1.txt'), 'utf-8');
const rawdata2 = fs.readFileSync(path.join(__dirname, 'linereport2.txt'), 'utf-8');

const originalData = `abcdef
2021.09.05 Sunday
10:46 6202009483 ชญาณ์นันท์ changed the chat's profile photo.
10:52 6202506132 ภาวิตา joined the chat.
11:51 6102000665 รมย์ joined the chat.`;
const newData = `joined the chat.
17:54 5902504520 นฤมล joined the chat.
17:54 Auto-reply สวัสดีทุกคน ฉันคือบอตที่จะช่วยคุณส่งข้อความอัตโนมัติ ไม่ว่าจะเป็นข้อความทักทายสมาชิกใหม่ การส่งข้อความแบบตั้งเวลา หรือตอบข้อความที่ตรงกับคีย์เวิร์ดที่กำหนดไว้
17:54 5702501635ยูสรอ joined the chat.
17:54 5602053646อริยา joined the chat.
17:54 5802043074 พัชริดา joined the chat.
17:54 5902028827 ณัฐชยา joined the chat.
17:54 5702024117 ขจีรัตน์ joined the chat.
17:54 5902033306 พรทิพย์ joined the chat.
17:54 5902015345 ชลธิชา joined the chat.`;
const expectedData = `2021.09.05 Sunday
10:46 6202009483 ชญาณ์นันท์ changed the chat's profile photo.
10:52 6202506132 ภาวิตา joined the chat.
11:51 6102000665 รมย์ joined the chat.
17:54 5902504520 นฤมล joined the chat.
17:54 Auto-reply สวัสดีทุกคน ฉันคือบอตที่จะช่วยคุณส่งข้อความอัตโนมัติ ไม่ว่าจะเป็นข้อความทักทายสมาชิกใหม่ การส่งข้อความแบบตั้งเวลา หรือตอบข้อความที่ตรงกับคีย์เวิร์ดที่กำหนดไว้
17:54 5702501635ยูสรอ joined the chat.
17:54 5602053646อริยา joined the chat.
17:54 5802043074 พัชริดา joined the chat.
17:54 5902028827 ณัฐชยา joined the chat.
17:54 5702024117 ขจีรัตน์ joined the chat.
17:54 5902033306 พรทิพย์ joined the chat.
17:54 5902015345 ชลธิชา joined the chat.`;

test('process line report service', async () => {
  const service = new LineReportService(rawdata1);
  await service.process();
});

test('clean data', () => {
  let s;
  s = new LineReportService(originalData);
  expect(s.rawdata.match(/^2021.09.05 Sunday/)).toBeTruthy();
  s = new LineReportService(newData);
  expect(s.rawdata.match(/^17:54 5902504520 นฤมล joined the chat./)).toBeTruthy();
  s = new LineReportService(newData, originalData);
  expect(s.rawdata).toBe(expectedData);
  s = new LineReportService('abcdef\n2021.09.05 Sunday');
  expect(s.rawdata).toBe('2021.09.05 Sunday');
  s = new LineReportService('abcdef');
  expect(s.rawdata).toBe('');
});

test('extract user and chat', () => {
  const service = new LineReportService(rawdata2);
  expect(service._extractUser('08:02 6302027112 Surapong unsent a message.')).toBe('6302027112 Surapong');
  expect(service._extractUser('08:04 5902001550ณิชชากร 5902001550 ณิชชากร สู่สุข')).toBe('5902001550ณิชชากร');
  expect(service._extractUser('08:29 6002039011 ศุภราภรณ์ 6002039011 ศุภราภรณ์ สุวรรณพรม')).toBe(
    '6002039011 ศุภราภรณ์'
  );
  expect(service._extractUser('08:41 5902059947 ชุลีพร 5902059947 ชุลีพร วณิชกุลชัยพร')).toBe('5902059947 ชุลีพร');
  expect(service._extractUser('09:00 สุชาติ Photos')).toBe('สุชาติ');
  expect(
    service._extractUser('09:02 สุชาติ นศ  ครับเทอมนี้คณะเป็นผู้จัดการเรื่องเชิญเข้าห้องขอให้รอนะครับ')
  ).toBeNull();
  expect(service._extractUser('09:08 6302029522ณัฏกฤตา 6302029522 ณัฏกฤตา ชิตเดชะ')).toBe('6302029522ณัฏกฤตา');
  expect(service._extractUser('09:19 5902512036 5902512036 ชญานิศ จงพัฒนพงศ์')).toBe('5902512036');
  expect(service._extractUser('09:42 6002003033 นาตยา 6002003033 นาตยา พรรณขาม')).toBe('6002003033 นาตยา');
  expect(service._extractUser('09:47 5704035889 จารุวรรณ 5704035889 จารุวรรณ กำดัด')).toBe('5704035889 จารุวรรณ');
  expect(service._extractUser('09:55 6002501127ศิริลักษณ์ 6002501127 ศิริลักษณ์ คำเป๊ก')).toBe('6002501127ศิริลักษณ์');
  expect(service._extractUser('10:21 6102037394 สิทธิพร 6102037123 สิทธิพร พงษ์สิงห์')).toBeNull();
  expect(service._extractUser('10:41 5902019750 ธีรเดช เมื่อวานมีเจ้าหน้าที่เชิญเข้าห้องสอบแล้วคับ')).toBeNull();
  expect(service._extractUser('10:47 ประวีณา 6002023387 6002023387 ประวีณา พงษ์จะโปะ')).toBe('ประวีณา 6002023387');
  expect(service._extractUser('10:47 5902012086 สุภาพร unsent a message.')).toBe('5902012086 สุภาพร');
  expect(service._extractUser('10:48 5902012086 สุภาพร 5902012086 สุภาพร พิมพ์โกทา')).toBe('5902012086 สุภาพร');
  expect(service._extractUser('10:51 5802006295สไบทิพย์  5802006295 สไบทิพย์ รักษายศ')).toBe('5802006295สไบทิพย์');
  expect(service._extractUser('10:51 สไบทิพย์  5802006295 สไบทิพย์ รักษายศ')).toBe('สไบทิพย์');
  expect(service._extractUser('10:51 สไบทิพย์  สไบทิพย์ รักษายศ 5802006295')).toBe('สไบทิพย์');
  expect(service._extractUser('10:51 สไบทิพย์  สไบทิพย์ รักษายศ 5802006295')).toBe('สไบทิพย์');
});
