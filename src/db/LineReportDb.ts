import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Result } from '../services/linereport';
import { Firestore } from './Firestore';

class LineReportDb {
  getResult(subject: string) {
    return getDoc(doc(Firestore.lineReportCollection(), subject));
  }

  setResult(subject: string, result: Result) {
    return setDoc(doc(Firestore.lineReportCollection(), subject), result);
  }
}

export const lineReportDb = new LineReportDb();
