import { doc, getDoc } from '@firebase/firestore';
import { flatObject } from '../util';
import { Firestore } from './Firestore';

export enum MaterialType {
  SUBJECT = 'subject',
  BOOK = 'book',
  LECTURE = 'lecture',
  APP = 'app',
  APPCHILD = 'appchild',
}

export type Material = {
  id: string;
  nameEn: string;
  nameTh: string;
  descEn: string;
  descTh: string;
  shortDescEn: string;
  shortDescTh: string;
  type: MaterialType;
  matadata: any;
  link: string;
  thumbnail: string;
  tag: string[];
  pinned: boolean;
  timestamp: number;
};

export class MaterialFs {
  static async getAll(): Promise<(Material & { key: string })[]> {
    const snapshot = await getDoc(doc(Firestore.materialCollection()));
    if (snapshot.exists()) {
      return flatObject<Material & { key: string }>(snapshot.data());
    }
    return [];
  }

  static async get(key: string) {
    const snapshot = await getDoc(doc(Firestore.materialCollection(), key));
    if (snapshot.exists()) {
      return snapshot.data() as Material;
    }
    return null;
  }
}
