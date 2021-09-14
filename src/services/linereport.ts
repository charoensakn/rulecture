import ExcelJS from 'exceljs';
import i18n from 'i18next';
import moment from 'moment';
import { Log, Result, Student } from '../db/LineReportFs';
import { mergeString } from '../util';

const DATE_PATTERN = /^(\d{4}\.\d{2}\.\d{2}) (?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/m;
const TIME_PATTERN = /^(\d{2}):(\d{2}) /m;
const AUTOREPLY_PATTERN = /^\d{2}:\d{2} Auto-reply/;
const STUDENTID_PATTERN = /([@]?\d{10})/;
const MSG_PATTERN = /^.*[\s]+[\r\n]+/;

export class LineReportService {
  rawdata: string;
  _cursor = 0;
  _chatDate: moment.Moment | null = null;
  _nextDate: moment.Moment | null = null;
  start: string | null = null;
  end: string | null = null;
  students = new Map<string, Student>();
  errors: Log[] = [];

  constructor(rawdata: string, originalData?: string) {
    this.rawdata = mergeString(this._clean(originalData), this._clean(rawdata), '\n');
  }

  _clean(data?: string) {
    if (!data) {
      return '';
    }
    let ret = '';
    let dateIndex = -1;
    let timeIndex = -1;
    let m = data.match(DATE_PATTERN);
    if (m && m[0]) {
      dateIndex = data.indexOf(m[0]);
    }
    m = data.match(/^\d{2}:\d{2} /m);
    if (m && m[0]) {
      timeIndex = data.indexOf(m[0]);
    }
    if (dateIndex >= 0 && timeIndex >= 0) {
      ret = data.substr(dateIndex < timeIndex ? dateIndex : timeIndex);
    } else if (dateIndex >= 0) {
      ret = data.substr(dateIndex);
    } else if (timeIndex >= 0) {
      ret = data.substr(timeIndex);
    }
    return ret.trim();
  }

  _readline() {
    if (this._nextDate) {
      this._chatDate = this._nextDate;
      this._nextDate = null;
    }
    const m = this.rawdata.substr(this._cursor + 6, 1024).match(TIME_PATTERN);
    if (m && m[1] && m[2]) {
      const i = this.rawdata.indexOf(`${m[1]}:${m[2]}`, this._cursor + 6);
      let line = this.rawdata.substring(this._cursor, i - 1);
      this._cursor = i;
      const d = line.match(DATE_PATTERN);
      if (d && d[1]) {
        if (this._chatDate) {
          this._nextDate = moment(d[1], 'YYYY.MM.DD');
        } else {
          this._chatDate = moment(d[1], 'YYYY.MM.DD');
        }
      }
      if (this._chatDate) {
        this._chatDate.hour(parseInt(m[1]));
        this._chatDate.minute(parseInt(m[2]));
        if (!this.start) {
          this.start = moment(this._chatDate).toISOString(true);
        }
      }
      return d && d[0] && !line.startsWith(d[0]) ? line.substr(0, line.indexOf(d[0])) : line;
    }
    if (this._cursor < this.rawdata.length) {
      const ret = this.rawdata.substr(this._cursor);
      this._cursor += ret.length;
      return ret;
    }
    return null;
  }

  _isSystemMessage(line: string) {
    if (line.match(AUTOREPLY_PATTERN)) {
      return true;
    }
    if (line.match(DATE_PATTERN)) {
      return true;
    }
    let i;
    if ((i = line.indexOf("changed the chat's profile photo.")) >= 0 && line.length === i + 33) {
      return true;
    }
    if ((i = line.indexOf('joined the chat.')) >= 0 && line.length === i + 16) {
      return true;
    }
    if ((i = line.indexOf('unsent a message.')) >= 0 && line.length === i + 17) {
      return true;
    }
    if ((i = line.indexOf('Photos')) >= 0 && line.length === i + 6) {
      return true;
    }
    if ((i = line.indexOf('added Auto-reply to the chat.')) >= 0 && line.length === i + 29) {
      return true;
    }
    if ((i = line.indexOf('changed the chat\'s name to "')) >= 0 && line.length > i + 28) {
      return true;
    }
    return false;
  }

  _extractUser(line: string) {
    if (line.match(AUTOREPLY_PATTERN)) {
      return null;
    }
    if (line.match(DATE_PATTERN)) {
      return null;
    }
    let i;
    if ((i = line.indexOf("changed the chat's profile photo.")) >= 0 && line.length === i + 33) {
      return line.substring(5, i).trim();
    }
    if ((i = line.indexOf('joined the chat.')) >= 0 && line.length === i + 16) {
      return line.substring(5, i).trim();
    }
    if ((i = line.indexOf('unsent a message.')) >= 0 && line.length === i + 17) {
      return line.substring(5, i).trim();
    }
    if ((i = line.indexOf('Photos')) >= 0 && line.length === i + 6) {
      return line.substring(5, i).trim();
    }
    if ((i = line.indexOf('added Auto-reply to the chat.')) >= 0 && line.length === i + 29) {
      return line.substring(5, i).trim();
    }
    if ((i = line.indexOf('changed the chat\'s name to "')) >= 0 && line.length > i + 28) {
      return line.substring(5, i).trim();
    }
    let ret = null;
    let msg = line.substring(6);
    const m = msg.match(STUDENTID_PATTERN);
    if (m && m[1] && m[1].length === 10) {
      const found = msg.lastIndexOf(m[1]);
      if (found > 0) {
        ret = msg.substr(0, found - 1).trim();
        const s = ret.split(/\s+/g);
        if (s[0] && s[1] && s[1].localeCompare(s[0]) === 0) {
          /**
           * 0123456789 ? 0123456789 ?
           * name name ? 0123456789 ?
           */
          ret = s[0];
        }
        if (s[0] && s[0].length >= 10 && s[0].match(m[1])) {
          if (s[0].length > 10) {
            /**
             * 0123456789name ? 0123456789 ?
             */
            ret = s[0];
          } else if (s[0].length === 10 && s[1]) {
            /**
             * 0123456789 name ? 0123456789 ?
             */
            ret = msg.substr(0, msg.indexOf(s[1]) + s[1].length);
          }
        } else if (s[1] && s[1].length === 10 && s[1].localeCompare(m[1]) === 0) {
          /**
           * name 0123456789 ? 0123456789 ?
           */
          ret = msg.substr(0, msg.indexOf(s[1]) + s[1].length);
        }
      }
    }
    return ret ? ret : null;
  }

  _extractStudent = (line: string) => {
    const m = line.match(STUDENTID_PATTERN);
    if (m && m[1] && m[1].length === 10) {
      const id = m[1];
      const name = line.replaceAll(m[1], '').replaceAll('\u200B', '').replaceAll(/\s+/g, ' ').trim();
      return { id, name };
    }
    return null;
  };

  async process(): Promise<Result> {
    const userSet = new Set<string>();
    let line: string | null;
    while ((line = this._readline())) {
      const u = this._extractUser(line);
      if (u) {
        userSet.add(u);
      }
    }
    let users: string[] = [];
    userSet.forEach((u) => {
      users.push(u);
    });
    /**
     * sort users for longest matching
     */
    users.sort((a, b) => {
      if (b.length > a.length) {
        return 1;
      } else if (b.length < a.length) {
        return -1;
      }
      return b.localeCompare(a);
    });

    this._cursor = 0;
    let m: RegExpMatchArray | null;
    while ((line = this._readline())) {
      if (this._isSystemMessage(line)) {
        continue;
      }
      let user = '',
        studentId = '',
        name = '';
      let msg = line.substring(6);
      for (const u of users) {
        if (msg.startsWith(u)) {
          user = u;
          const chat = msg.substr(u.length);
          /**
           * try to extract from single line
           * */
          if ((m = chat.match(MSG_PATTERN)) && m[0]) {
            const student = this._extractStudent(m[0]);
            if (student) {
              studentId = student.id;
              name = student.name;
            }
          }
          if (!studentId || !name) {
            const student = this._extractStudent(chat);
            if (student) {
              if (!studentId) studentId = student.id;
              if (!name) name = student.name;
            }
          }
          break;
        }
      }

      const timestamp = moment(
        this._chatDate ? this._chatDate.format('YYYYMMDD') + line.substr(0, 5) : '2000010100:00',
        'YYYYMMDDHH:mm'
      ).toISOString(true);
      if (user && (studentId || name)) {
        this.students.set(user, { lineId: user, studentId, name, msg: line, timestamp });
      } else if (!user) {
        this.errors.push({ msg: line, timestamp });
      }
      this.end = timestamp;
    }

    return {
      rawdata: this.rawdata,
      students: Array.from(this.students.values()),
      errors: this.errors,
      start: this.start || null,
      end: this.end || null,
    };
  }

  export(subject: string, save = false) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(subject);
    worksheet.columns = [
      { key: 'line', header: i18n.t('line'), width: 30, alignment: { vertical: 'middle', horizontal: 'left' } },
      {
        key: 'studentid',
        header: i18n.t('studentid'),
        width: 20,
        alignment: { vertical: 'middle', horizontal: 'center' },
      },
      { key: 'name', header: i18n.t('name'), width: 40, alignment: { vertical: 'middle', horizontal: 'left' } },
      {
        key: 'reportdate',
        header: i18n.t('reportdate'),
        width: 40,
        alignment: { vertical: 'middle', horizontal: 'center' },
      },
    ];
    worksheet.getRow(1).height = 20;
    const it = this.students.values();
    for (let i = 0, d = it.next(); !d.done; i++, d = it.next()) {
      const { lineId: line, studentId: studentid, name, timestamp: reportdate } = d.value;
      if (d) {
        const row = worksheet.getRow(i + 2);
        row.height = 20;
        row.values = {
          line,
          studentid,
          name,
          reportdate,
        };
      }
    }
    for (const i of ['A', 'B', 'C', 'D']) {
      const cell = worksheet.getCell(`${i}1`);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
    for (let j = 0; j < this.students.size; j++) {
      for (const i of ['A', 'B', 'C', 'D']) {
        const cell = worksheet.getCell(`${i}${j + 2}`);
        if (j === this.students.size - 1) {
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
          `linereport-${subject}_${moment().format('YYYYMMDDHHmm')}.xlsx`
        );
      });
    }
    return workbook;
  }

  saveAsRaw(subject: string) {
    saveAs(
      new Blob([this.rawdata], { type: 'text/plain' }),
      `linereport-${subject}_${moment().format('YYYYMMDDHHmm')}.txt`
    );
  }
}
