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

export class TorontoDatabase extends Dexie {
  contractors!: Table<Contractor>;
  movements!: Table<Movement>;

  constructor() {
    super('TorontoSentinelDB');
    this.version(1).stores({
      contractors: '++id, uuid, fullName, company',
      movements: '++id, contractorUuid, type, timestamp, gate'
    });
  }
}

export const db = new TorontoDatabase();
