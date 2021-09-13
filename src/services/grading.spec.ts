import fs from 'fs';
import 'jest';
import os from 'os';
import path from 'path';
import { GradingService, KeyType } from './grading';

const FILE_SIZE = 10;
const QUESTION_SIZE = 20;
const CHOICE_SIZE = 5;
const TEXT_SIZE = 80;
const STUDENT_SIZE = 5000;
const CORRECT_THRESHOLD = 0.4;

const samplek1 =
  (fs.existsSync(path.join(__dirname, 'grading-k1.csv')) &&
    fs.readFileSync(path.join(__dirname, 'grading-k1.csv'), 'utf-8')) ||
  '';
const samplek2 =
  (fs.existsSync(path.join(__dirname, 'grading-k2.csv')) &&
    fs.readFileSync(path.join(__dirname, 'grading-k2.csv'), 'utf-8')) ||
  '';
const samplek3 =
  (fs.existsSync(path.join(__dirname, 'grading-k3.csv')) &&
    fs.readFileSync(path.join(__dirname, 'grading-k3.csv'), 'utf-8')) ||
  '';
const samplek4 =
  (fs.existsSync(path.join(__dirname, 'grading-k4.csv')) &&
    fs.readFileSync(path.join(__dirname, 'grading-k4.csv'), 'utf-8')) ||
  '';
const samplek5 =
  (fs.existsSync(path.join(__dirname, 'grading-k5.csv')) &&
    fs.readFileSync(path.join(__dirname, 'grading-k5.csv'), 'utf-8')) ||
  '';
const samplea1 =
  (fs.existsSync(path.join(__dirname, 'grading-a1.csv')) &&
    fs.readFileSync(path.join(__dirname, 'grading-a1.csv'), 'utf-8')) ||
  '';
const samplea2 =
  (fs.existsSync(path.join(__dirname, 'grading-a2.csv')) &&
    fs.readFileSync(path.join(__dirname, 'grading-a2.csv'), 'utf-8')) ||
  '';
const samplea3 =
  (fs.existsSync(path.join(__dirname, 'grading-a3.csv')) &&
    fs.readFileSync(path.join(__dirname, 'grading-a3.csv'), 'utf-8')) ||
  '';
const samplea4 =
  (fs.existsSync(path.join(__dirname, 'grading-a4.csv')) &&
    fs.readFileSync(path.join(__dirname, 'grading-a4.csv'), 'utf-8')) ||
  '';
const samplea5 =
  (fs.existsSync(path.join(__dirname, 'grading-a5.csv')) &&
    fs.readFileSync(path.join(__dirname, 'grading-a5.csv'), 'utf-8')) ||
  '';

const characters =
  'pb=*nhEBqc5U@k*$CY6FD6prZB*s_bJx8x*!7quhHmugH#uMw476HA#-*63U8L4b' +
  '#YgZGwR92kNcb@kupL_V_eHW&==vZT%8F55Z&C@amMK*dBwwMe$#MvCES%8hmADT';
const rand = (len: number) => {
  let ret = '';
  for (let i = 0; i < len; i++) {
    ret += characters[Math.floor(Math.random() * characters.length)];
  }
  return ret;
};
const arrToStr = (arr: string[]) => {
  return arr.map((a) => `"${a}"`).join(',') + os.EOL;
};
const objToArr = (o: any, cols: string[]) => {
  const arr: string[] = [];
  for (const col of cols) {
    arr.push(o[col] || '');
  }
  return arr;
};

test('grading sample 1', async () => {
  const service = new GradingService();
  service.addKey(samplek1);
  expect(service._keyMap.size).toBe(24);
  service.addKey(samplek2);
  expect(service._keyMap.size).toBe(44);
  service.addKey(samplek3);
  expect(service._keyMap.size).toBe(64);
  service.addKey(samplek4);
  expect(service._keyMap.size).toBe(84);
  service.addKey(samplek5);
  expect(service._keyMap.size).toBe(104);

  service.setKeyType('ประทับเวลา', KeyType.UNUSED);
  service.setKeyType('ชื่อผู้ใช้', KeyType.PRIMARY);
  service.setKeyType('รหัสนักศึกษา', KeyType.PRIMARY);
  service.setKeyType('ชื่อสกุล', KeyType.UNUSED);

  expect(service._keyMap.get('ประทับเวลา')).toMatchObject({
    k: 'ประทับเวลา',
    t: KeyType.UNUSED,
  });
  expect(service._keyMap.get('ชื่อผู้ใช้')).toMatchObject({
    k: 'ชื่อผู้ใช้',
    t: KeyType.PRIMARY,
  });
  expect(service._keyMap.get('รหัสนักศึกษา')).toMatchObject({
    k: 'รหัสนักศึกษา',
    t: KeyType.PRIMARY,
  });

  await service.addAnswer(samplea1);
  expect(service._answerMap.size).toBe(2000);
  await service.addAnswer(samplea2);
  expect(service._answerMap.size).toBe(2000);
  await service.addAnswer(samplea3);
  expect(service._answerMap.size).toBe(2000);
  await service.addAnswer(samplea4);
  expect(service._answerMap.size).toBe(2000);
  await service.addAnswer(samplea5);
  expect(service._answerMap.size).toBe(2000);

  service.stat(100);

  expect(service.maxScore).toBe(100);
  expect(service.coefficient).toBe(1.0);

  service.normReferencedTable();
  const ref = service.criterionReferencedTable();

  service.applyGrade(ref);

  service.export();
});

test.only('generate sample', () => {
  const source: any = {
    ประทับเวลา: '0000',
    ชื่อผู้ใช้: '0000',
    รหัสนักศึกษา: '0000',
    ชื่อสกุล: '0000',
  };
  const answers = [];
  for (let i = 0; i < CHOICE_SIZE; i++) {
    answers.push(rand(TEXT_SIZE));
  }
  const sourceMap = new Map<number, string[]>();
  const questionMap = new Map<number, { q: string; a: string }>();
  let questionCount = 0;
  for (let no = 1; no <= FILE_SIZE; no++) {
    const fk = fs.openSync(path.join(__dirname, `grading-k${no}.csv`), 'w');
    const fa = fs.openSync(path.join(__dirname, `grading-a${no}.csv`), 'w');
    const subSource = { ...source };
    for (let i = 0; i < QUESTION_SIZE; i++) {
      const q = `${++questionCount}-${rand(TEXT_SIZE)}`;
      const a = answers[Math.round(Math.random() * (CHOICE_SIZE - 1))] || rand(TEXT_SIZE);
      subSource[q] = a;
      questionMap.set(questionCount, { q, a });
    }
    const cols = Object.keys(subSource);
    sourceMap.set(no, cols);
    fs.writeSync(fk, arrToStr(cols));
    fs.writeSync(fk, arrToStr(objToArr(subSource, cols)));
    fs.closeSync(fk);
    fs.writeSync(fa, arrToStr(cols));
    fs.closeSync(fa);
  }

  const files = new Map<number, number>();
  for (let no = 1; no <= FILE_SIZE; no++) {
    files.set(no, fs.openSync(path.join(__dirname, `grading-a${no}.csv`), 'a'));
  }

  for (let c = 0; c < STUDENT_SIZE; c++) {
    const answer: any = {
      ประทับเวลา: rand(20),
      ชื่อผู้ใช้: rand(20),
      รหัสนักศึกษา: rand(10),
      ชื่อสกุล: rand(20),
    };
    questionCount = 0;
    for (let no = 1; no <= FILE_SIZE; no++) {
      const f = files.get(no);
      if (f) {
        const cols = sourceMap.get(no);
        if (cols) {
          const ans = { ...answer };
          for (let i = 0; i < QUESTION_SIZE; i++) {
            const map = questionMap.get(++questionCount);
            if (map) {
              const { q, a } = map;
              ans[q] = Math.random() > CORRECT_THRESHOLD ? a : answers[Math.round(Math.random() * 4)];
            }
          }
          fs.writeSync(f, arrToStr(objToArr(ans, cols)));
        }
      }
    }
  }

  for (let no = 1; no <= FILE_SIZE; no++) {
    const fd = files.get(no);
    if (fd) {
      fs.closeSync(fd);
    }
  }
});
