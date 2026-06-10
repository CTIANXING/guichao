import { create } from 'zustand';
import { roomDao, type Room, type CreateRoomInput } from '../db/roomDao';

interface RoomState {
  rooms: Room[];
  loading: boolean;
  loadRooms: () => Promise<void>;
  addRoom: (input: CreateRoomInput) => Promise<Room>;
  updateRoom: (id: string, updates: Partial<CreateRoomInput>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  loading: false,

  loadRooms: async () => {
    set({ loading: true });
    const rooms = await roomDao.getAll();
    set({ rooms, loading: false });
  },

  addRoom: async (input) => {
    const room = await roomDao.create(input);
    set((state) => ({ rooms: [...state.rooms, room] }));
    return room;
  },

  updateRoom: async (id, updates) => {
    await roomDao.update(id, updates);
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === id ? { ...r, ...updates, updated_at: new Date().toISOString() } : r
      ),
    }));
  },

  deleteRoom: async (id) => {
    await roomDao.delete(id);
    set((state) => ({ rooms: state.rooms.filter((r) => r.id !== id) }));
  },
}));
