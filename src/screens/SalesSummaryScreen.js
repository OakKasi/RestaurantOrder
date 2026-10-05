import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { getDailySalesByCategory, getDailySalesTotal } from '../db/db';

const getDate = (dayOffset) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d;
};

const getDayRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return [start.toISOString(), end.toISOString()];
};

export default function SalesSummaryScreen() {
  const db = useSQLiteContext();
  const [dayOffset, setDayOffset] = useState(0);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ bill_count: 0, total: 0 });

  const loadSales = useCallback(async () => {
    try {
      const [startIso, endIso] = getDayRange(getDate(dayOffset));
      setRows(await getDailySalesByCategory(db, startIso, endIso));
      setSummary(await getDailySalesTotal(db, startIso, endIso));
    } catch (error) {
      console.error('Error loading sales:', error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถโหลดยอดขายได้');
    }
  }, [db, dayOffset]);

  useFocusEffect(
    useCallback(() => {
      loadSales();
    }, [loadSales])
  );

  const dateLabel = getDate(dayOffset).toLocaleDateString('th-TH', { dateStyle: 'long' });

  return (
    <View style={styles.container}>
      <View style={styles.dateBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => setDayOffset((v) => v - 1)}>
          <Text style={styles.navText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>{dayOffset === 0 ? `วันนี้ · ${dateLabel}` : dateLabel}</Text>
        <TouchableOpacity
          style={[styles.navBtn, dayOffset >= 0 && { opacity: 0.3 }]}
          onPress={() => setDayOffset((v) => Math.min(0, v + 1))}
          disabled={dayOffset >= 0}
        >
          <Text style={styles.navText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(r) => String(r.category_id)}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>ไม่มียอดขายในวันนี้ (นับเฉพาะบิลที่ปิดแล้ว)</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.catName}>{item.category_name}</Text>
              <Text style={styles.catSub}>ขายได้ {item.total_qty} รายการ</Text>
            </View>
            <Text style={styles.catTotal}>{(item.total_sales / 100).toFixed(2)} บาท</Text>
          </View>
        )}
      />

      <View style={styles.totalBar}>
        <View>
          <Text style={styles.totalLabel}>ยอดขายรวม</Text>
          <Text style={styles.catSub}>{summary.bill_count} บิล</Text>
        </View>
        <Text style={styles.totalValue}>{(summary.total / 100).toFixed(2)} บาท</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  navBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, backgroundColor: '#e2e8f0' },
  navText: { fontSize: 18, fontWeight: 'bold', color: '#334155' },
  dateText: { fontSize: 16, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  catName: { fontSize: 16, fontWeight: '600' },
  catSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  catTotal: { fontSize: 16, fontWeight: 'bold', color: '#16a34a' },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#16a34a' },
});
