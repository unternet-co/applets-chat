import Dexie, { Table } from 'dexie';
import { AppletInstance } from '../features/applets';
import { ThreadItem } from '../features/thread';

export class Database extends Dexie {
  threadItems!: Table<ThreadItem, number>;
  appletInstances!: Table<AppletInstance, number>;

  constructor() {
    super('AppletChatDB');

    this.version(1).stores({
      threadItems: '++id',
      appletInstances: '++id',
    });
  }
}

export default new Database();
