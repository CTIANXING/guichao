import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing, Shadow } from '../../constants/theme';

export default function Room3DScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.empty}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🧊</Text>
          <Text style={styles.emptyTitle}>空间视图</Text>
          <Text style={styles.emptyDesc}>选择一个房间进入 3D 视图</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
    ...Shadow.card,
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
    lineHeight: 20,
  },
});
