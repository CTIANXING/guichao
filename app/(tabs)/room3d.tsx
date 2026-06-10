import { useEffect, useState, useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../../constants/theme';
import { useRoomStore } from '../../stores/roomStore';
import { useStorageStore } from '../../stores/storageStore';
import CubeDemo from '../../components/CubeDemo';
import UnitEditPanel from '../../components/UnitEditPanel';

export default function Room3DScreen() {
  const { rooms, loadRooms } = useRoomStore();
  const { units, loading, loadByRoomId, addUnit, updateUnit, deleteUnit } = useStorageStore();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      loadByRoomId(selectedRoomId);
      setSelectedUnitId(null);
    }
  }, [selectedRoomId]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const roomUnits = selectedRoomId ? (units[selectedRoomId] || []) : [];
  const selectedUnit = selectedUnitId ? roomUnits.find((u) => u.id === selectedUnitId) : undefined;

  const roomUnitsRef = useRef(roomUnits);
  roomUnitsRef.current = roomUnits;

  const handleAddUnit = useCallback(async () => {
    if (!selectedRoomId) return;
    const count = roomUnitsRef.current.length;
    const col = count % 4;
    const row = Math.floor(count / 4);
    await addUnit({
      room_id: selectedRoomId,
      pos_x: col * 2.5 - 3.75,
      pos_z: row * 2.5,
      pos_y: 0,
    });
  }, [selectedRoomId, addUnit]);

  const handleUpdateUnit = useCallback(async (id: string, updates: any) => {
    await updateUnit(id, updates);
  }, [updateUnit]);

  const handleDeleteUnit = useCallback(async (id: string) => {
    setSelectedUnitId(null);
    await deleteUnit(id);
  }, [deleteUnit]);

  if (rooms.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏠</Text>
          <Text style={styles.emptyTitle}>还没有房间</Text>
          <Text style={styles.emptyDesc}>先去「房间」页面创建一个房间</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.selectorBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorContent}>
          {rooms.map((room) => {
            const active = room.id === selectedRoomId;
            return (
              <TouchableOpacity
                key={room.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedRoomId(room.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{room.name}</Text>
                <Text style={[styles.chipRatio, active && styles.chipTextActive]}>
                  {room.ratio_x.toFixed(1)}×{room.ratio_z.toFixed(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {!selectedRoomId ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>👆</Text>
          <Text style={styles.emptyTitle}>选择房间</Text>
          <Text style={styles.emptyDesc}>点击上方房间标签进入 3D 视图</Text>
        </View>
      ) : loading || !selectedRoom ? (
        <View style={styles.empty}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : (
        <View style={styles.sceneContainer}>
          <CubeDemo
            roomId={selectedRoom.id}
            ratioX={selectedRoom.ratio_x}
            ratioZ={selectedRoom.ratio_z}
            units={roomUnits}
            selectedUnitId={selectedUnitId}
            selectedUnitName={selectedUnit?.name}
            onUnitSelect={setSelectedUnitId}
          />
          <TouchableOpacity style={styles.fab} onPress={handleAddUnit} activeOpacity={0.8}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedUnit && (
        <UnitEditPanel
          visible={!!selectedUnit}
          unit={selectedUnit}
          siblingUnits={roomUnits}
          onClose={() => setSelectedUnitId(null)}
          onUpdate={handleUpdateUnit}
          onDelete={handleDeleteUnit}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  selectorBar: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingVertical: Spacing.sm,
  },
  selectorContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipRatio: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  sceneContainer: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  emptyDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.button,
    zIndex: 10,
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 30,
  },
});
