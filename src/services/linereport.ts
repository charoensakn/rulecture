import moment from 'moment';
import { mergeString } from '../util';

const DATE_PATTERN = /^(\d{4}\.\d{2}\.\d{2}) (?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/m;
const TIME_PATTERN = /^(\d{2}):(\d{2}) /m;
const AUTOREPLY_PATTERN = /^\d{2}:\d{2} Auto-reply/;
const STUDENTID_PATTERN = /(\d{10})/;
const MSG_PATTERN = /^.*[\s]+[\r\n]?/;

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
      return d && d[0] && !line.startsWith(d[0]) ? line.substr(0, line.indexOf(d[0])) : line;
    }
    if (this.cursor < this.rawdata.length) {
      const ret = this.rawdata.substr(this.cursor);
      this.cursor += ret.length;
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
    if (m && m[1]) {
      const found = msg.lastIndexOf(m[1]);
      if (found > 0) {
        ret = msg.substr(0, found - 1).trim();
        const s = ret.split(/\s+/g);
        if (s[0] && s[1] && s[1].localeCompare(s[0]) === 0) {
          ret = s[0];
        }
        if (s[0] && s[0].length >= 10 && s[0].match(STUDENTID_PATTERN)) {
          if (s[0].length > 10) {
            ret = s[0];
          } else if (s[0].length === 10 && s[1]) {
            ret = msg.substr(0, msg.indexOf(s[1]) + s[1].length);
          }
        } else if (s[1] && s[1].length === 10 && s[1].match(STUDENTID_PATTERN)) {
          ret = msg.substr(0, msg.indexOf(s[1]) + s[1].length);
        }
      }
    }
    return ret ? ret : null;
  }

  _extractStudent = (line: string) => {
    const m = line.match(STUDENTID_PATTERN);
    if (m && m[1]) {
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

    this.cursor = 0;
    let m: RegExpMatchArray | null;
    while ((line = this._readline())) {
      if (this._isSystemMessage(line)) {
        continue;
      }
      const datetime = this.chatDate ? moment(this.chatDate).toISOString(true) : '2000-01-01T00:00:00.000+07:00';
      let user = '',
        studentId = '',
        name = '';
      let msg = line.substring(6);
      for (let u of users) {
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
      if (user && (studentId || name)) {
        this.students.set(user, { lineId: user, studentId, name, datetime });
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
