import { useState, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { StorageUnit } from '../db/storageUnitDao';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../constants/theme';

const UNIT_COLORS = [
  '#AADDFF',
  '#FFCCAA',
  '#AADDCC',
  '#DDCCFF',
  '#FFEECC',
  '#FFCCDD',
  '#CCE5FF',
  '#DDDDDD',
];

interface UnitEditPanelProps {
  visible: boolean;
  unit: StorageUnit;
  siblingUnits: StorageUnit[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<{
    name: string;
    color: string;
    scale_x: number;
    scale_y: number;
    scale_z: number;
    parent_id: string | null;
  }>) => void;
  onDelete: (id: string) => void;
}

export default function UnitEditPanel({
  visible,
  unit,
  siblingUnits,
  onClose,
  onUpdate,
  onDelete,
}: UnitEditPanelProps) {
  const [name, setName] = useState(unit.name);
  const [color, setColor] = useState(unit.color);
  const [scaleX, setScaleX] = useState(String(unit.scale_x));
  const [scaleY, setScaleY] = useState(String(unit.scale_y));
  const [scaleZ, setScaleZ] = useState(String(unit.scale_z));
  const [parentId, setParentId] = useState<string | null>(unit.parent_id);

  useEffect(() => {
    setName(unit.name);
    setColor(unit.color);
    setScaleX(String(unit.scale_x));
    setScaleY(String(unit.scale_y));
    setScaleZ(String(unit.scale_z));
    setParentId(unit.parent_id);
  }, [unit]);

  function commits() {
    const updates: Record<string, unknown> = {};
    if (name !== unit.name) updates.name = name;
    if (color !== unit.color) updates.color = color;

    const sx = parseFloat(scaleX);
    if (!isNaN(sx) && sx > 0 && sx !== unit.scale_x) updates.scale_x = sx;

    const sy = parseFloat(scaleY);
    if (!isNaN(sy) && sy > 0 && sy !== unit.scale_y) updates.scale_y = sy;

    const sz = parseFloat(scaleZ);
    if (!isNaN(sz) && sz > 0 && sz !== unit.scale_z) updates.scale_z = sz;

    if (parentId !== unit.parent_id) {
      updates.parent_id = parentId;
      if (parentId) {
        const parent = siblingUnits.find((u) => u.id === parentId);
        if (parent) {
          updates.pos_y = parent.pos_y + parent.scale_y;
          updates.pos_x = parent.pos_x;
          updates.pos_z = parent.pos_z;
        }
      } else {
        updates.pos_y = 0;
      }
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(unit.id, updates as any);
    }
    onClose();
  }

  const candidates = siblingUnits.filter((u) => u.id !== unit.id);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>编辑储物单元</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>名称</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="例如：衣柜上层"
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.label}>颜色</Text>
            <View style={styles.colorRow}>
              {UNIT_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorChip,
                    { backgroundColor: c },
                    color === c && styles.colorChipActive,
                  ]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>

            <Text style={styles.label}>尺寸</Text>
            {([
              ['长 (X)', scaleX, setScaleX],
              ['高 (Y)', scaleY, setScaleY],
              ['宽 (Z)', scaleZ, setScaleZ],
            ] as const).map(([slabel, val, setter]) => (
              <View key={slabel} style={styles.sizeRow}>
                <Text style={styles.sizeLabel}>{slabel}</Text>
                <View style={styles.sizeRight}>
                  <TouchableOpacity
                    style={styles.sizeBtn}
                    onPress={() => {
                      const v = Math.max(0.2, parseFloat(val) - 0.5);
                      setter(v.toFixed(1));
                    }}
                  >
                    <Text style={styles.sizeBtnText}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.sizeInput}
                    value={val}
                    onChangeText={setter}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.textSecondary}
                  />
                  <TouchableOpacity
                    style={styles.sizeBtn}
                    onPress={() => {
                      const v = Math.min(8, parseFloat(val) + 0.5);
                      setter(v.toFixed(1));
                    }}
                  >
                    <Text style={styles.sizeBtnText}>+</Text>
                  </TouchableOpacity>
                  <Text style={styles.sizeUnit}>米</Text>
                </View>
              </View>
            ))}

            {candidates.length > 0 && (
              <>
                <Text style={styles.label}>摞在…上面</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.parentRow}>
                  <TouchableOpacity
                    style={[styles.parentChip, parentId === null && styles.parentChipActive]}
                    onPress={() => setParentId(null)}
                  >
                    <Text style={[styles.parentChipText, parentId === null && styles.parentChipTextActive]}>地板</Text>
                  </TouchableOpacity>
                  {candidates.map((u) => (
                    <TouchableOpacity
                      key={u.id}
                      style={[styles.parentChip, parentId === u.id && styles.parentChipActive]}
                      onPress={() => setParentId(u.id)}
                    >
                      <Text style={[styles.parentChipText, parentId === u.id && styles.parentChipTextActive]}>
                        {u.name || '未命名'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={commits} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>保存</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => {
                onDelete(unit.id);
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteBtnText}>删除此储物单元</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '75%',
    ...Shadow.card,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  closeBtn: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
  },
  body: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorChip: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorChipActive: {
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sizeLabel: {
    fontSize: FontSize.sm,
    color: Colors.text,
    width: 50,
  },
  sizeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sizeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeBtnText: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: FontWeight.semibold,
  },
  sizeInput: {
    width: 56,
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: FontSize.md,
    color: Colors.text,
    textAlign: 'center',
  },
  sizeUnit: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    width: 20,
  },
  parentRow: {
    marginBottom: Spacing.sm,
  },
  parentChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  parentChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  parentChipText: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  parentChipTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  saveBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
  },
  deleteBtn: {
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  deleteBtnText: {
    fontSize: FontSize.md,
    color: Colors.danger,
  },
});
