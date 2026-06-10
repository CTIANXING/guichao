import { getDatabase } from './database';
import { itemDao } from './itemDao';

export interface AICategory {
  id: string;
  name: string;
  description: string;
  item_ids: string;
  created_at: string;
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

export const aiCategoryDao = {
  async getAll(): Promise<AICategory[]> {
    const db = await getDatabase();
    return db.getAllAsync<AICategory>('SELECT * FROM ai_category ORDER BY created_at');
  },

  async getById(id: string): Promise<AICategory | null> {
    const db = await getDatabase();
    return db.getFirstAsync<AICategory>('SELECT * FROM ai_category WHERE id = ?', [id]);
  },

  async create(category: { name: string; description?: string; item_ids?: string[] }): Promise<AICategory> {
    const db = await getDatabase();
    const id = uuid();
    const timestamp = now();
    const itemIds = category.item_ids ?? [];
    const record: AICategory = {
      id,
      name: category.name,
      description: category.description ?? '',
      item_ids: JSON.stringify(itemIds),
      created_at: timestamp,
    };
    await db.runAsync(
      `INSERT INTO ai_category (id, name, description, item_ids, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [record.id, record.name, record.description, record.item_ids, record.created_at]
    );
    if (itemIds.length > 0) {
      await itemDao.updateCategoryIds(id, itemIds);
    }
    return record;
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM ai_category WHERE id = ?', [id]);
  },

  async replaceAll(
    categories: { name: string; description?: string; item_ids: string[] }[]
  ): Promise<AICategory[]> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM ai_category');
    await itemDao.clearAllCategories();
    const results: AICategory[] = [];
    for (const cat of categories) {
      const record = await aiCategoryDao.create(cat);
      results.push(record);
    }
    return results;
  },
};
