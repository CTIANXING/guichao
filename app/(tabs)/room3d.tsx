import { StyleSheet, Text, View } from 'react-native';

export default function Room3DScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>空间视图</Text>
      <Text style={styles.subtitle}>3D 房间 — 即将上线</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
});
