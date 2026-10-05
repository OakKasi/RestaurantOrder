import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { getKitchenItems, updateOrderItemStatus } from '../db/db';

const STATUSES = [
  { key: 'pending', label: 'รอทำ', color: '#f59e0b' },
  { key: 'cooking', label: 'กำลังทำ', color: '#0284c7' },
  { key: 'served', label: 'เสิร์ฟแล้ว', color: '#16a34a' },
];

export default function KitchenScreen() {
  const db = useSQLiteContext();
  const [items, setItems] = useState([]);
  const [showServed, setShowServed] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    try {
      const rows = await getKitchenItems(db, showServed);
      setItems(rows);
    } catch (error) {
      console.error('Error loading kitchen items:', error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถดึงรายการครัวได้');
    } finally {
      setLoading(false);
    }
  }, [db, showServed]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const handleChangeStatus = async (item, newStatus) => {
    if (item.status === newStatus) return;
    try {
      await updateOrderItemStatus(db, item.id, newStatus);
      await loadItems();
    } catch (error) {
      console.error('Update status error:', error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowServed((v) => !v)}>
        <Text style={styles.toggleText}>
          {showServed ? 'ซ่อนรายการที่เสิร์ฟแล้ว' : 'แสดงรายการที่เสิร์ฟแล้ว'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>ไม่มีรายการที่ต้องทำ</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.tableText}>โต๊ะ {item.table_number} · รอบที่ {item.round_number}</Text>
              <Text style={styles.timeText}>{formatTime(item.ordered_at)}</Text>
            </View>
            <Text style={styles.menuText}>x{item.quantity} {item.menu_name}</Text>
            {item.note ? <Text style={styles.noteText}>หมายเหตุ: {item.note}</Text> : null}

            <View style={styles.statusRow}>
              {STATUSES.map((s) => {
                const active = item.status === s.key;
                return (
                  <TouchableOpacity
                    key={s.key}
                    style={[styles.statusBtn, active && { backgroundColor: s.color, borderColor: s.color }]}
                    onPress={() => handleChangeStatus(item, s.key)}
                  >
                    <Text style={[styles.statusText, active && { color: '#fff', fontWeight: 'bold' }]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  toggleBtn: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
  toggleText: { color: '#0284c7', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  tableText: { fontWeight: 'bold', fontSize: 15 },
  timeText: { color: '#64748b' },
  menuText: { fontSize: 17, marginTop: 6 },
  noteText: { color: '#dc2626', marginTop: 4 },
  statusRow: { flexDirection: 'row', marginTop: 10 },
  statusBtn: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, alignItems: 'center', marginHorizontal: 3 },
  statusText: { color: '#334155' },
});