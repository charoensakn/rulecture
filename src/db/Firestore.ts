import { getFirestore, collection } from '@firebase/firestore';

export class Firestore {
  static groupCollection() {
    return collection(getFirestore(), 'group');
  }

  static lineReportCollection() {
    return collection(getFirestore(), 'linereport');
  }

  static materialCollection() {
    return collection(getFirestore(), 'materials');
  }

  static notificationCollection() {
    return collection(getFirestore(), 'notifications');
  }
}
