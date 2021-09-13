import ExcelJS from 'exceljs';
import moment from 'moment';
import Papa from 'papaparse';
import { maxSorted, mean, medianSorted, minSorted, modeSorted, standardDeviation, variance } from 'simple-statistics';

const GRADES = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];

export enum KeyType {
  PRIMARY,
  QUESTION,
  UNUSED,
}

export type Key = { k: string; v: string; t: KeyType; i: number };
export type Answer = { k: string; score: number; coescore: number; grade: string };

export class GradingService {
  _keyMap = new Map<string, Key>();
  _answerMap = new Map<string, Map<string, string | number>>();
  maxScore: number = 0;
  coefficient: number = 0;
  _scores: number[] = [];
  frequecies: any = {};
  min: number = 0;
  max: number = 0;
  range: number = 0;
  mean: number = 0;
  median: number = 0;
  mode: number = 0;
  standardDeviation: number = 0;
  variance: number = 0;

  addKey(input: string) {
    const records: any[] = Papa.parse(input, {
      delimiter: ',',
      header: true,
      encoding: 'utf-8',
      skipEmptyLines: true,
      preview: 1,
    }).data;
    if (records && records.length > 0) {
      for (const k in records[0]) {
        const key = this._keyMap.get(k);
        if (!key) {
          this._keyMap.set(k, { k, v: records[0][k], t: KeyType.QUESTION, i: this._keyMap.size });
        } else {
          key.v = records[0][k];
        }
      }
    }
  }

  listKeys() {
    return Array.from(this._keyMap.values()).sort((a, b) => a.i - b.i);
  }

  listAnswers() {
    const ret: Answer[] = [];
    this._answerMap.forEach((a, k) => {
      ret.push({
        k,
        score: (a.get('__score__') || 0) as number,
        coescore: (a.get('__coescore__') || 0) as number,
        grade: (a.get('__grade__') || '__null__') as string,
      });
    });
    return ret;
  }

  setKeyType(key: string, type: KeyType) {
    const k = this._keyMap.get(key);
    if (k) {
      k.t = type;
    }
  }

  async addAnswer(input: string) {
    return new Promise<void>((resolve, reject) => {
      const primaryKeys = this.listKeys().filter((k) => k.t === KeyType.PRIMARY);
      if (primaryKeys.length === 0) {
        reject('missing primary key');
      }
      const primaryKey = `__${primaryKeys.map((pk) => pk.k).join('__')}__`;
      const keys = this.listKeys();
      Papa.parse(input, {
        delimiter: ',',
        header: true,
        encoding: 'utf-8',
        skipEmptyLines: true,
        worker: true,
        step: (results) => {
          let record: any = results.data;
          /**
           * build key value
           */
          let primaryKeyValue = '__';
          for (let pk of primaryKeys) {
            primaryKeyValue += `${record[pk.k] || 'null'}__`;
          }
          let ans = this._answerMap.get(primaryKeyValue);
          if (!ans) {
            ans = new Map<string, string>();
            ans.set(primaryKey, primaryKeyValue);
            this._answerMap.set(primaryKeyValue, ans);
          }
          /**
           * check answer
           */
          let score = 0;
          for (let k of keys) {
            if (ans.get(k.k) === undefined) {
              const v = record[k.k];
              if (v && k.t === KeyType.QUESTION && k.v.localeCompare(v) === 0) {
                score++;
              }
              ans.set(k.k, v);
            }
          }
          /**
           * add score
           */
          const lastScore = ans.get('__score__') as number;
          ans.set('__score__', !lastScore ? score : lastScore + score);
        },
        complete: () => {
          resolve();
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  stat(maxScore?: number) {
    const len = this.listKeys().filter((k) => k.t === KeyType.QUESTION).length;
    this.maxScore = maxScore ? maxScore : len;
    this.coefficient = this.maxScore !== len ? this.maxScore / len : 1;

    this._scores = [];
    this.frequecies = {};
    for (let f = 0; f <= this.maxScore; f++) {
      this.frequecies[f] = 0;
    }
    this._answerMap.forEach((ans) => {
      const score = (ans.get('__score__') || 0) as number;
      const coescore = Math.round(score * this.coefficient);
      ans.set('__coescore__', coescore);
      this._scores.push(coescore);
      this.frequecies[coescore]++;
    });
    this._scores.sort((a, b) => a - b);

    this.min = minSorted(this._scores);
    this.max = maxSorted(this._scores);
    this.range = this.max - this.min;
    this.mean = mean(this._scores);
    this.median = medianSorted(this._scores);
    this.mode = modeSorted(this._scores);
    this.standardDeviation = standardDeviation(this._scores);
    this.variance = variance(this._scores);
  }

  _referencedTable(a: number, d: number) {
    const mod = (a - d) % 6;
    const dif = Math.floor((a - d) / 6);
    const difs: number[] = [];
    for (let i = 0; i < 6; i++) {
      difs[i] = dif;
    }
    switch (mod) {
      case 1:
        difs[2]++;
        break;
      case 2:
        difs[2]++;
        difs[3]++;
        break;
      case 3:
        difs[1]++;
        difs[2]++;
        difs[3]++;
        break;
      case 4:
        difs[1]++;
        difs[2]++;
        difs[3]++;
        difs[4]++;
        break;
      case 5:
        difs[0]++;
        difs[1]++;
        difs[2]++;
        difs[3]++;
        difs[4]++;
        break;
    }

    const t = new ReferencedTable();
    t.setMaxScore(this.maxScore);
    t.setGradeMin('A', a);

    t.setGradeMin('B+', t.getGrade('A').min - (difs[0] ? difs[0] : 1));
    t.setGradeMin('B', t.getGrade('B+').min - (difs[1] ? difs[1] : 1));
    t.setGradeMin('C+', t.getGrade('B').min - (difs[2] ? difs[2] : 1));
    t.setGradeMin('C', t.getGrade('C+').min - (difs[3] ? difs[3] : 1));
    t.setGradeMin('D+', t.getGrade('C').min - (difs[4] ? difs[4] : 1));
    t.setGradeMin('D', t.getGrade('D+').min - (difs[5] ? difs[5] : 1));

    for (const score of this._scores) {
      for (const i of GRADES) {
        const grade = t.getGrade(i);
        if (score >= grade.min && score <= grade.max) {
          grade.count++;
          break;
        }
      }
    }
    return t.table();
  }

  freqReferencedTable() {
    const len = this.listKeys().filter((k) => k.t === KeyType.QUESTION).length;
    let max = this.maxScore ? this.maxScore : len;
    const width = Math.floor(max / 10);
    const rows: ReferencedRow[] = [];
    for (let min = max - (width - 1); max >= 0; min = max - (width - 1)) {
      if (min < 0) {
        min = 0;
      }
      rows.push({ row: `${max} - ${min}`, max, min, count: 0 });
      max = min - 1;
    }
    for (const k in this.frequecies) {
      const f = parseInt(k);
      for (const row of rows) {
        if (row.min <= f && f <= row.max) {
          row.count += this.frequecies[k];
          break;
        }
      }
    }

    return rows;
  }

  normReferencedTable() {
    const a = Math.round(this.median + 1.5 * this.standardDeviation);
    const d = a - Math.round((this.standardDeviation / 2) * 6);

    return this._referencedTable(a, d);
  }

  criterionReferencedTable() {
    return this._referencedTable(Math.round(this.maxScore * 0.8), Math.round(this.maxScore * 0.5));
  }

  applyGrade(ref: ReferencedRow[]) {
    ref.forEach((r) => {
      r.count = 0;
    });
    this._answerMap.forEach((ans) => {
      const coescore = (ans.get('__coescore__') || 0) as number;
      if (coescore) {
        for (const r of ref) {
          if (r.min <= coescore && coescore <= r.max) {
            r.count++;
            ans.set('__grade__', r.row);
            break;
          }
        }
      }
    });
    return ref;
  }

  export(save = false) {
    const keys = this.listKeys().filter((k) => k.t !== KeyType.QUESTION);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet();
    const keysColumns = keys.map((k) => ({
      key: k.k,
      header: k.k,
      width: 25,
      alignment: { vertical: 'middle', horizontal: 'left' },
    })) as any;
    sheet.columns = [
      ...keysColumns,
      {
        key: '__score__',
        header: '__score__',
        width: 10,
        alignment: { vertical: 'middle', horizontal: 'center' },
      },
      {
        key: '__coescore__',
        header: '__coescore__',
        width: 10,
        alignment: { vertical: 'middle', horizontal: 'center' },
      },
      {
        key: '__grade__',
        header: '__grade__',
        width: 10,
        alignment: { vertical: 'middle', horizontal: 'center' },
      },
    ];
    sheet.getRow(1).height = 20;
    const answers = this._answerMap.values();
    let count = 0;
    let answer;
    while ((answer = answers.next()) && !answer.done) {
      const d = answer.value;
      if (d) {
        const row = sheet.getRow(count++ + 2);
        row.height = 20;
        const rowValues: any = {};
        for (const k of keys) {
          rowValues[k.k] = d.get(k.k) || '__null__';
        }
        row.values = {
          ...rowValues,
          __score__: d.get('__score__'),
          __coescore__: d.get('__coescore__'),
          __grade__: d.get('__grade__'),
        };
      }
    }
    const columns = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const cols = [];
    for (let i = 0; i < keys.length + 3; i++) {
      cols.push(columns[i]);
    }
    for (const i of cols) {
      const cell = sheet.getCell(`${i}1`);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
    for (let j = 0; j < count; j++) {
      for (const i of cols) {
        const cell = sheet.getCell(`${i}${j + 2}`);
        if (j === count - 1) {
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
    if (save) {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(
          new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
          `grading_${moment().format('YYYYMMDDHHmm')}.xlsx`
        );
      });
    }

    return workbook;
  }
}

export type ReferencedRow = { row: string; min: number; max: number; count: number };

class ReferencedTable {
  _table = new Map<string, ReferencedRow>();

  constructor() {
    for (const i of GRADES) {
      this._table.set(i, { row: i, min: 0, max: 0, count: 0 });
    }
  }

  setMaxScore(max: number) {
    const row = this._table.get('A');
    if (row) {
      row.max = max;
    }
  }

  setGradeMin(grade: string, min: number) {
    const i = GRADES.indexOf(grade);
    if (i >= 0 && i < GRADES.length - 1) {
      const row = this._table.get(GRADES[i] || '');
      const low = this._table.get(GRADES[i + 1] || '');
      if (row && low) {
        row.min = min;
        low.max = min - 1;
      }
    }
  }

  getGrade(grade: string): ReferencedRow {
    return this._table.get(grade) || { row: grade, min: 0, max: 0, count: 0 };
  }

  table() {
    const ret: ReferencedRow[] = [];
    for (const i of GRADES) {
      const row = this._table.get(i);
      if (row) {
        ret.push(row);
      }
    }
    return ret;
  }
}
