import fs from 'fs';
import 'jest';
import path from 'path';
import { LineReportService } from './linereport';

const rawdata = fs.readFileSync(path.join(__dirname, 'linereport.txt'), 'utf-8');

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

test('can process line report service', () => {
  const service = new LineReportService(rawdata);
  service.process();
});

test('can clean data', () => {
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
