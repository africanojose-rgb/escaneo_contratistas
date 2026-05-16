import Dexie, { type Table } from 'dexie';

export interface Contractor {
  id?: number;
  uuid: string;
  fullName: string;
  company: string;
  position: string;
  idPhoto?: string; // base64
  expiryDate: string;
  createdAt: number;
}

export interface Movement {
  id?: number;
  contractorUuid: string;
  type: 'ENTRADA' | 'SALIDA';
  timestamp: number;
  gate: string;
}

export interface UserProfile {
  id?: number;
  name: string;
  position: string;
  photo?: string;
}

export class TorontoDatabase extends Dexie {
  contractors!: Table<Contractor>;
  movements!: Table<Movement>;
  userProfile!: Table<UserProfile>;

  constructor() {
    super('TorontoSentinelDB');
    this.version(2).stores({
      contractors: '++id, uuid, fullName, company',
      movements: '++id, contractorUuid, type, timestamp, gate',
      userProfile: '++id'
    });
  }
}

export const db = new TorontoDatabase();
