import { doc, getDoc, setDoc } from '@firebase/firestore';
import { Firestore } from './Firestore';

export type Student = { lineId: string; studentId: string; name: string; msg: string; timestamp: string };
export type Log = { msg: string; timestamp: string };
export type Result = {
  rawdata: string;
  students: Student[];
  errors: Log[];
  start: string | null;
  end: string | null;
};

export class LineReportFs {
  static getResult(subject: string) {
    return getDoc(doc(Firestore.lineReportCollection(), subject));
  }

  static setResult(subject: string, result: Result) {
    return setDoc(doc(Firestore.lineReportCollection(), subject), result);
  }
}
