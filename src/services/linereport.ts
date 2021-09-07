import moment from 'moment';
import { mergeString } from '../util';

const DATE_PATTERN = /^(\d{4}\.\d{2}\.\d{2}) (?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/m;
const TIME_PATTERN = /^(\d{2}):(\d{2}) /m;
const AUTOREPLY_PATTERN = /^\d{2}:\d{2} Auto-reply/;
const STUDENTID_PATTERN = /(\d{10})/;
const MSG_PATTERN = /^.*[\r\n]/;

export type Student = { lineId: string; studentId: string; name: string; datetime: string };
export type Log = { msg: string; datetime: string };
export type Result = {
  rawdata: string;
  students: Student[];
  errors: Log[];
  start: string | null;
  end: string | null;
};

export class LineReportService {
  rawdata: string;
  cursor = 0;
  chatDate: moment.Moment | null = null;
  start: moment.Moment | null = null;
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
    const m = this.rawdata.substr(this.cursor + 6, 1024).match(TIME_PATTERN);
    if (m && m[1] && m[2]) {
      const i = this.rawdata.indexOf(`${m[1]}:${m[2]}`, this.cursor + 6);
      let line = this.rawdata.substring(this.cursor, i - 1);
      this.cursor = i;
      const d = line.match(DATE_PATTERN);
      if (d && d[1]) {
        this.chatDate = moment(d[1], 'YYYY.MM.DD');
      }
      if (this.chatDate) {
        this.chatDate.hour(parseInt(m[1]));
        this.chatDate.minute(parseInt(m[2]));
        if (!this.start) {
          this.start = moment(this.chatDate);
        }
      }
      return line;
    }
    return null;
  }

  async process(): Promise<Result> {
    const users = new Set<string>();
    let m: RegExpMatchArray | null;
    let i: number;
    let line: string | null;
    while ((line = this._readline())) {
      if ((i = line.indexOf("changed the chat's profile photo.")) >= 0) {
        users.add(line.substring(5, i).trim());
        continue;
      }
      if ((i = line.indexOf('joined the chat.')) >= 0) {
        users.add(line.substring(5, i).trim());
        continue;
      }
      if ((i = line.indexOf('unsent a message.')) >= 0) {
        users.add(line.substring(5, i).trim());
        continue;
      }
      if (line.match(AUTOREPLY_PATTERN)) {
        continue;
      }
      if (line.match(DATE_PATTERN)) {
        continue;
      }
      let msg = line.substring(6);
      if ((m = msg.match(MSG_PATTERN)) && m[0]) {
        msg = m[0];
      }
      let user: string | null = null;
      let chat: string | null = null;
      const iter = users.values();
      let u;
      while ((u = iter.next().value)) {
        if (msg.startsWith(u)) {
          user = u;
          chat = msg.substring(u.length + 1);
          break;
        }
      }
      if (!user && (m = msg.match(STUDENTID_PATTERN)) && m[1]) {
        let first = msg.indexOf(m[1]);
        let next = msg.indexOf(m[1], first + 10);
        if (next > 0 && msg.length > next + 15) {
          user = msg.substring(0, next - 1).trim();
          users.add(user);
          chat = msg.substring(next);
        } else if (next < 0 && msg.length > first + 15) {
          user = msg.substring(0, first - 1).trim();
          chat = msg.substring(first);
        }
      }
      const datetime = this.chatDate ? moment(this.chatDate).toISOString(true) : '2000-01-01T00:00:00.000+07:00';
      if (user && chat) {
        if ((m = chat.match(STUDENTID_PATTERN)) && m[1]) {
          const studentId = m[1];
          const name = chat.replaceAll(m[1], '').replaceAll('\u200B', '').replaceAll(/\s+/g, ' ').trim();
          this.students.set(user, { lineId: user, studentId, name, datetime });
        }
      } else {
        this.errors.push({ msg: line, datetime });
      }
    }
    return {
      rawdata: this.rawdata,
      students: Array.from(this.students.values()),
      errors: this.errors,
      start: this.start?.toISOString(true) || null,
      end: this.chatDate?.toISOString(true) || null,
    };
  }
}
