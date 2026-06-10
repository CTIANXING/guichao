import { getDatabase } from './database';

export interface Item {
  id: string;
  storage_unit_id: string;
  name: string;
  quantity: number;
  notes: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateItemInput {
  storage_unit_id: string;
  name: string;
  quantity?: number;
  notes?: string;
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

export const itemDao = {
  async getByStorageUnitId(storageUnitId: string): Promise<Item[]> {
    const db = await getDatabase();
    return db.getAllAsync<Item>(
      'SELECT * FROM item WHERE storage_unit_id = ? ORDER BY created_at DESC',
      [storageUnitId]
    );
  },

  async getAll(): Promise<Item[]> {
    const db = await getDatabase();
    return db.getAllAsync<Item>('SELECT * FROM item ORDER BY created_at DESC');
  },

  async getById(id: string): Promise<Item | null> {
    const db = await getDatabase();
    return db.getFirstAsync<Item>('SELECT * FROM item WHERE id = ?', [id]);
  },

  async getByCategoryId(categoryId: string): Promise<Item[]> {
    const db = await getDatabase();
    return db.getAllAsync<Item>('SELECT * FROM item WHERE category_id = ?', [categoryId]);
  },

  async create(input: CreateItemInput): Promise<Item> {
    const db = await getDatabase();
    const id = uuid();
    const timestamp = now();
    const item: Item = {
      id,
      storage_unit_id: input.storage_unit_id,
      name: input.name,
      quantity: input.quantity ?? 1,
      notes: input.notes ?? '',
      category_id: null,
      created_at: timestamp,
      updated_at: timestamp,
    };
    await db.runAsync(
      `INSERT INTO item (id, storage_unit_id, name, quantity, notes, category_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [item.id, item.storage_unit_id, item.name, item.quantity, item.notes, item.category_id, item.created_at, item.updated_at]
    );
    return item;
  },

  async update(id: string, updates: Partial<{ name: string; quantity: number; notes: string; category_id: string | null }>): Promise<void> {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.quantity !== undefined) { fields.push('quantity = ?'); values.push(updates.quantity); }
    if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
    if (updates.category_id !== undefined) { fields.push('category_id = ?'); values.push(updates.category_id); }
    fields.push('updated_at = ?');
    values.push(now());
    values.push(id);
    await db.runAsync(`UPDATE item SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM item WHERE id = ?', [id]);
  },

  async deleteByStorageUnitId(storageUnitId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM item WHERE storage_unit_id = ?', [storageUnitId]);
  },

  async updateCategoryIds(categoryId: string, itemIds: string[]): Promise<void> {
    const db = await getDatabase();
    for (const id of itemIds) {
      await db.runAsync('UPDATE item SET category_id = ? WHERE id = ?', [categoryId, id]);
    }
  },

  async clearAllCategories(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('UPDATE item SET category_id = NULL');
  },
};
