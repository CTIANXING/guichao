import { create } from 'zustand';
import { storageUnitDao, type StorageUnit, type CreateStorageUnitInput } from '../db/storageUnitDao';

interface StorageState {
  units: Record<string, StorageUnit[]>;
  loading: boolean;
  loadByRoomId: (roomId: string) => Promise<void>;
  addUnit: (input: CreateStorageUnitInput) => Promise<StorageUnit>;
  updateUnit: (id: string, updates: Partial<CreateStorageUnitInput>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
}

export const useStorageStore = create<StorageState>((set, get) => ({
  units: {},
  loading: false,

  loadByRoomId: async (roomId: string) => {
    set({ loading: true });
    const list = await storageUnitDao.getByRoomId(roomId);
    set((state) => ({ units: { ...state.units, [roomId]: list }, loading: false }));
  },

  addUnit: async (input) => {
    const unit = await storageUnitDao.create(input);
    set((state) => {
      const list = state.units[unit.room_id] || [];
      return { units: { ...state.units, [unit.room_id]: [...list, unit] } };
    });
    return unit;
  },

  updateUnit: async (id, updates) => {
    await storageUnitDao.update(id, updates);
    const existing = await storageUnitDao.getById(id);
    if (!existing) return;
    set((state) => {
      const roomUnits = state.units[existing.room_id] || [];
      return {
        units: {
          ...state.units,
          [existing.room_id]: roomUnits.map((u) =>
            u.id === id ? { ...u, ...updates, updated_at: new Date().toISOString() } : u
          ),
        },
      };
    });
  },

  deleteUnit: async (id) => {
    const existing = await storageUnitDao.getById(id);
    await storageUnitDao.delete(id);
    if (!existing) return;
    set((state) => {
      const roomUnits = state.units[existing.room_id] || [];
      return {
        units: {
          ...state.units,
          [existing.room_id]: roomUnits.filter((u) => u.id !== id),
        },
      };
    });
  },
}));
