import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { getClosedBills } from '../db/db';

export default function BillHistoryScreen({ navigation }) {
  const db = useSQLiteContext();
  const [bills, setBills] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          setBills(await getClosedBills(db));
        } catch (error) {
          console.error('Error loading history:', error);
          Alert.alert('ผิดพลาด', 'ไม่สามารถโหลดประวัติบิลได้');
        }
      })();
    }, [db])
  );

  const formatDateTime = (iso) =>
    new Date(iso).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <FlatList
      style={styles.container}
      data={bills}
      keyExtractor={(b) => String(b.id)}
      contentContainerStyle={{ padding: 12 }}
      ListEmptyComponent={<Text style={styles.empty}>ยังไม่มีบิลที่ปิดแล้ว</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('BillSummaryScreen', { billId: item.id, tableNumber: item.table_number })
          }
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>บิล #{item.id} · โต๊ะ {item.table_number}</Text>
            <Text style={styles.sub}>ปิดเมื่อ {formatDateTime(item.closed_at)}</Text>
          </View>
          <Text style={styles.total}>{(item.total / 100).toFixed(2)} บาท</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  total: { fontSize: 16, fontWeight: 'bold', color: '#16a34a' },
});