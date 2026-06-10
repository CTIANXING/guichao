import { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../constants/theme';

interface CreateRoomModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, ratioX: number, ratioZ: number) => void;
}

const RATIO_PRESETS = [
  { label: '方形', x: 3.0, z: 3.0 },
  { label: '标准', x: 4.0, z: 3.0 },
  { label: '长形', x: 5.0, z: 3.0 },
  { label: '细长', x: 6.0, z: 2.5 },
];

export default function CreateRoomModal({ visible, onClose, onCreate }: CreateRoomModalProps) {
  const [name, setName] = useState('');
  const [ratioX, setRatioX] = useState(4.0);
  const [ratioZ, setRatioZ] = useState(3.0);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed, ratioX, ratioZ);
    setName('');
    setRatioX(4.0);
    setRatioZ(3.0);
  };

  const handleClose = () => {
    setName('');
    setRatioX(4.0);
    setRatioZ(3.0);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>新建房间</Text>

          <Text style={styles.label}>房间名称</Text>
          <TextInput
            style={styles.input}
            placeholder="例如：卧室、厨房、客厅"
            placeholderTextColor={Colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={styles.label}>房间尺寸（米）</Text>
          <View style={styles.preview}>
            <View style={[styles.previewRoom, { aspectRatio: ratioX / ratioZ }]}>
              <Text style={styles.previewLabel}>{ratioX.toFixed(1)} × {ratioZ.toFixed(1)} 米</Text>
            </View>
          </View>

          <View style={styles.presets}>
            {RATIO_PRESETS.map((p) => (
              <TouchableOpacity
                key={p.label}
                style={[
                  styles.presetBtn,
                  ratioX === p.x && ratioZ === p.z && styles.presetActive,
                ]}
                onPress={() => { setRatioX(p.x); setRatioZ(p.z); }}
              >
                <Text
                  style={[
                    styles.presetText,
                    ratioX === p.x && ratioZ === p.z && styles.presetTextActive,
                  ]}
                >
                  {p.label} ({p.x}×{p.z})
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>长：{ratioX.toFixed(1)} 米</Text>
          {Platform.OS === 'web' ? (
            <input
              type="range"
              min={1.0}
              max={12.0}
              step={0.1}
              value={ratioX}
              onInput={(e) => {
                setRatioX(parseFloat((e.target as HTMLInputElement).value));
              }}
              style={{ width: '100%', height: 20, accentColor: Colors.primary }}
            />
          ) : (
            <Slider
              style={styles.slider}
              minimumValue={1.0}
              maximumValue={12.0}
              step={0.1}
              value={ratioX}
              onValueChange={(v) => setRatioX(Math.round(v * 10) / 10)}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.primary}
            />
          )}

          <Text style={styles.label}>宽：{ratioZ.toFixed(1)} 米</Text>
          {Platform.OS === 'web' ? (
            <input
              type="range"
              min={1.0}
              max={12.0}
              step={0.1}
              value={ratioZ}
              onInput={(e) => {
                setRatioZ(parseFloat((e.target as HTMLInputElement).value));
              }}
              style={{ width: '100%', height: 20, accentColor: Colors.primary }}
            />
          ) : (
            <Slider
              style={styles.slider}
              minimumValue={1.0}
              maximumValue={12.0}
              step={0.1}
              value={ratioZ}
              onValueChange={(v) => setRatioZ(Math.round(v * 10) / 10)}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.primary}
            />
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !name.trim() && styles.confirmBtnDisabled]}
              onPress={handleCreate}
              disabled={!name.trim()}
            >
              <Text style={styles.confirmText}>创建</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    maxHeight: '90%',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  preview: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  previewRoom: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    width: '100%',
    maxWidth: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  presetBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  presetText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  presetTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  webSlider: {
    width: '100%',
    paddingVertical: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    ...Shadow.button,
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
  },
});
