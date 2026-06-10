import { getDatabase } from './database';

export interface Room {
  id: string;
  name: string;
  ratio_x: number;
  ratio_y: number;
  ratio_z: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRoomInput {
  name: string;
  ratio_x?: number;
  ratio_y?: number;
  ratio_z?: number;
}

function now(): string {
  return new Date().toISOString();
}

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const roomDao = {
  async getAll(): Promise<Room[]> {
    const db = await getDatabase();
    return db.getAllAsync<Room>('SELECT * FROM room ORDER BY sort_order, created_at');
  },

  async getById(id: string): Promise<Room | null> {
    const db = await getDatabase();
    return db.getFirstAsync<Room>('SELECT * FROM room WHERE id = ?', [id]);
  },

  async create(input: CreateRoomInput): Promise<Room> {
    const db = await getDatabase();
    const id = uuid();
    const timestamp = now();
    const room: Room = {
      id,
      name: input.name,
      ratio_x: input.ratio_x ?? 3.0,
      ratio_y: input.ratio_y ?? 1.0,
      ratio_z: input.ratio_z ?? 2.0,
      sort_order: 0,
      created_at: timestamp,
      updated_at: timestamp,
    };
    await db.runAsync(
      `INSERT INTO room (id, name, ratio_x, ratio_y, ratio_z, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [room.id, room.name, room.ratio_x, room.ratio_y, room.ratio_z, room.sort_order, room.created_at, room.updated_at]
    );
    return room;
  },

  async update(id: string, updates: Partial<CreateRoomInput>): Promise<void> {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: (string | number)[] = [];
    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.ratio_x !== undefined) { fields.push('ratio_x = ?'); values.push(updates.ratio_x); }
    if (updates.ratio_y !== undefined) { fields.push('ratio_y = ?'); values.push(updates.ratio_y); }
    if (updates.ratio_z !== undefined) { fields.push('ratio_z = ?'); values.push(updates.ratio_z); }
    fields.push('updated_at = ?');
    values.push(now());
    values.push(id);
    await db.runAsync(`UPDATE room SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM room WHERE id = ?', [id]);
  },
};
