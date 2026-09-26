import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getBillTotal } from '../db/db';

export default function BillSummaryScreen({ route, navigation }) {
  const { billId, tableNumber } = route.params;
  const db = useSQLiteContext();
  const [rounds, setRounds] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadBill = useCallback(async () => {
    setLoading(true);
    const roundRows = await db.getAllAsync(
      'SELECT id, round_number, ordered_at FROM order_rounds WHERE bill_id = ? ORDER BY round_number',
      billId
    );
    const roundsWithItems = [];
    for (const round of roundRows) {
      const items = await db.getAllAsync(
        'SELECT oi.menu_item_id, mi.name as menu_name, oi.quantity, oi.note, oi.price_at_order, oi.status FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.round_id = ?',
        round.id
      );
      roundsWithItems.push({ ...round, items });
    }
    setRounds(roundsWithItems);

    const totalStang = await getBillTotal(db, billId);
    setTotal(totalStang);
    setLoading(false);
  }, [db, billId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadBill);
    return unsubscribe;
  }, [navigation, loadBill]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { flex: 1,textAlign: 'center' }]}>สรุปบิล โต๊ะ {tableNumber}</Text>
      </View>

      <FlatList
        data={rounds}
        keyExtractor={(round) => String(round.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item: round }) => (
          <View style={styles.roundBox}>
            <Text style={styles.roundTitle}>รอบที่ {round.round_number}</Text>
            {round.items.map((it, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemText}>
                  x{it.quantity} {it.menu_name} {it.note ? `- ${it.note}` : ''}
                </Text>
                <Text style={styles.itemPrice}>
                  {((it.quantity * it.price_at_order) / 100).toFixed(2)} บาท
                </Text>
              </View>
            ))}
            
            <View style={styles.sumRow}>
              <Text style={styles.sumText}>ยอดรวม</Text>
              <Text style={styles.sumValue}>
                {(round.items.reduce((sum, it) => sum + (it.quantity * it.price_at_order),0) / 100).toFixed(2)} บาท
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>ยังไม่มีการสั่งอาหารในบิลนี้</Text>}
      />

      <View style={styles.totalBar}>
        <Text style={styles.totalLabel}>ยอดรวมทั้งบิล</Text>
        <Text style={styles.totalValue}>{(total / 100).toFixed(2)} บาท</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  container: { 
    flex: 1, 
    paddingTop: 42, 
    backgroundColor: '#f4f4f4' 
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  backBtn: { 
    width: 50 
  },
  backBtnText: { 
    color: '#0284c7', 
    fontWeight: 'bold' 
  },
  headerTitle: { 
    textAlign: 'center',
    fontSize: 18, 
    fontWeight: 'bold',
    
  },
  roundBox: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 10 
  },
  roundTitle: { 
    fontWeight: 'bold', 
    marginBottom: 6 
  },
  itemRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 3 
  },
  itemText: { 
    fontSize: 14, 
    flex: 1 
  },
  itemPrice: { 
    fontSize: 14, 
    color: '#333' 
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#eee',
    marginTop: 8,
    paddingTop: 8,
  },
  sumText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  sumValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16a34a', // สีเขียวแสดงราคารวม
  },
  empty: { 
    textAlign: 'center',
    marginTop: 40, 
    color: '#888' 
  },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  totalLabel: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  totalValue: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#16a34a' 
  },
});