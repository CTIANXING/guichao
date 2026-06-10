import { getDatabase } from './database';

export interface StorageUnit {
  id: string;
  room_id: string;
  parent_id: string | null;
  name: string;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  scale_x: number;
  scale_y: number;
  scale_z: number;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateStorageUnitInput {
  room_id: string;
  parent_id?: string | null;
  name?: string;
  pos_x?: number;
  pos_y?: number;
  pos_z?: number;
  scale_x?: number;
  scale_y?: number;
  scale_z?: number;
  color?: string;
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

export const storageUnitDao = {
  async getByRoomId(roomId: string): Promise<StorageUnit[]> {
    const db = await getDatabase();
    return db.getAllAsync<StorageUnit>(
      'SELECT * FROM storage_unit WHERE room_id = ? ORDER BY sort_order, created_at',
      [roomId]
    );
  },

  async getById(id: string): Promise<StorageUnit | null> {
    const db = await getDatabase();
    return db.getFirstAsync<StorageUnit>('SELECT * FROM storage_unit WHERE id = ?', [id]);
  },

  async getChildren(parentId: string): Promise<StorageUnit[]> {
    const db = await getDatabase();
    return db.getAllAsync<StorageUnit>(
      'SELECT * FROM storage_unit WHERE parent_id = ? ORDER BY sort_order',
      [parentId]
    );
  },

  async create(input: CreateStorageUnitInput): Promise<StorageUnit> {
    const db = await getDatabase();
    const id = uuid();
    const timestamp = now();
    const unit: StorageUnit = {
      id,
      room_id: input.room_id,
      parent_id: input.parent_id ?? null,
      name: input.name ?? '',
      pos_x: input.pos_x ?? 0,
      pos_y: input.pos_y ?? 0,
      pos_z: input.pos_z ?? 0,
      scale_x: input.scale_x ?? 1,
      scale_y: input.scale_y ?? 1,
      scale_z: input.scale_z ?? 1,
      color: input.color ?? '#AADDFF',
      sort_order: 0,
      created_at: timestamp,
      updated_at: timestamp,
    };
    await db.runAsync(
      `INSERT INTO storage_unit (id, room_id, parent_id, name, pos_x, pos_y, pos_z, scale_x, scale_y, scale_z, color, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [unit.id, unit.room_id, unit.parent_id, unit.name, unit.pos_x, unit.pos_y, unit.pos_z,
       unit.scale_x, unit.scale_y, unit.scale_z, unit.color, unit.sort_order, unit.created_at, unit.updated_at]
    );
    return unit;
  },

  async update(id: string, updates: Partial<CreateStorageUnitInput>): Promise<void> {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.parent_id !== undefined) { fields.push('parent_id = ?'); values.push(updates.parent_id); }
    if (updates.pos_x !== undefined) { fields.push('pos_x = ?'); values.push(updates.pos_x); }
    if (updates.pos_y !== undefined) { fields.push('pos_y = ?'); values.push(updates.pos_y); }
    if (updates.pos_z !== undefined) { fields.push('pos_z = ?'); values.push(updates.pos_z); }
    if (updates.scale_x !== undefined) { fields.push('scale_x = ?'); values.push(updates.scale_x); }
    if (updates.scale_y !== undefined) { fields.push('scale_y = ?'); values.push(updates.scale_y); }
    if (updates.scale_z !== undefined) { fields.push('scale_z = ?'); values.push(updates.scale_z); }
    if (updates.color !== undefined) { fields.push('color = ?'); values.push(updates.color); }
    fields.push('updated_at = ?');
    values.push(now());
    values.push(id);
    await db.runAsync(`UPDATE storage_unit SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM storage_unit WHERE id = ?', [id]);
  },
};
