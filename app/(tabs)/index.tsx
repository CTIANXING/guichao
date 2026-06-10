import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { roomDao } from '../../db/roomDao';
import { storageUnitDao } from '../../db/storageUnitDao';
import { itemDao } from '../../db/itemDao';
import { aiCategoryDao } from '../../db/aiCategoryDao';
import { settingsDao } from '../../db/settingsDao';

export default function HomeScreen() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const results: string[] = [];
      const pass = (msg: string) => results.push(`✅ ${msg}`);
      const fail = (msg: string, e: unknown) => results.push(`❌ ${msg}: ${String(e)}`);

      try {
        const room = await roomDao.create({ name: '测试房间', ratio_x: 4, ratio_z: 3 });
        const fetched = await roomDao.getById(room.id);
        if (fetched?.name === '测试房间') pass('创建+读取 Room');
        else fail('创建+读取 Room', '数据不匹配');

        await roomDao.update(room.id, { name: '更新后的房间' });
        const updated = await roomDao.getById(room.id);
        if (updated?.name === '更新后的房间') pass('更新 Room');
        else fail('更新 Room', '名称未更新');

        const unit = await storageUnitDao.create({ room_id: room.id, name: '测试柜子', scale_x: 2 });
        const fetchedUnit = await storageUnitDao.getById(unit.id);
        if (fetchedUnit?.name === '测试柜子') pass('创建+读取 StorageUnit');
        else fail('创建+读取 StorageUnit', '数据不匹配');

        const unit2 = await storageUnitDao.create({ room_id: room.id, parent_id: unit.id, name: '柜子上层' });
        const children = await storageUnitDao.getChildren(unit.id);
        if (children.length === 1 && children[0].name === '柜子上层') pass('父子关系 StorageUnit');
        else fail('父子关系 StorageUnit', '子单元未关联');

        const item = await itemDao.create({ storage_unit_id: unit.id, name: '红色马克杯', quantity: 2 });
        const fetchedItem = await itemDao.getById(item.id);
        if (fetchedItem?.name === '红色马克杯' && fetchedItem.quantity === 2) pass('创建+读取 Item');
        else fail('创建+读取 Item', '数据不匹配');

        const cat = await aiCategoryDao.create({ name: '厨具', item_ids: [item.id] });
        if (cat.name === '厨具') pass('创建 AICategory');
        else fail('创建 AICategory', '名称不匹配');

        await aiCategoryDao.replaceAll([
          { name: '新分类1', item_ids: [item.id] },
          { name: '新分类2', item_ids: [] },
        ]);
        const allCats = await aiCategoryDao.getAll();
        if (allCats.length === 2) pass('全量替换 AICategory');
        else fail('全量替换 AICategory', `期望 2 条，实际 ${allCats.length}`);

        await settingsDao.set('test_key', 'test_value');
        const val = await settingsDao.get('test_key');
        if (val === 'test_value') pass('读写 Settings');
        else fail('读写 Settings', `期望 test_value，实际 ${val}`);

        await itemDao.delete(item.id);
        await itemDao.deleteByStorageUnitId(unit.id);
        await storageUnitDao.delete(unit2.id);
        await storageUnitDao.delete(unit.id);
        await roomDao.delete(room.id);
        pass('清理测试数据');
      } catch (e) {
        fail('整体执行', e);
      }

      setLogs(results);
    })();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.brandIcon}>🏠</Text>
        <Text style={styles.title}>归巢</Text>
        <Text style={styles.subtitle}>让每一件物品，都有家可归</Text>
      </View>
      <View style={styles.testPanel}>
        <Text style={styles.testTitle}>Day 2 数据层自检</Text>
        {logs.map((log, i) => (
          <Text key={i} style={styles.logLine}>{log}</Text>
        ))}
        {logs.length === 0 && (
          <Text style={styles.logLine}>⏳ 运行中...</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  brandIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    letterSpacing: 1,
  },
  testPanel: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 360,
  },
  testTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  logLine: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontFamily: 'monospace',
    lineHeight: 22,
  },
});
