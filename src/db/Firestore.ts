import { getFirestore, collection } from '@firebase/firestore';

export class Firestore {
  static lineReportCollection() {
    return collection(getFirestore(), 'linereport');
  }
}
