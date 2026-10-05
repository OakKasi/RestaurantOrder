import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { getBillTotal, getBillRoundItems, getBillStatus, closeBill } from '../db/db';

export default function BillSummaryScreen({ route, navigation }) {
  const { billId, tableNumber } = route.params;
  const db = useSQLiteContext();
  const [rounds, setRounds] = useState([]);
  const [total, setTotal] = useState(0);
  const [billStatus, setBillStatus] = useState('open');
  const [loading, setLoading] = useState(true);

  const loadBill = useCallback(async () => {
    try {
      const rows = await getBillRoundItems(db, billId);
      const grouped = [];
      for (const r of rows) {
        let g = grouped[grouped.length - 1];
        if (!g || g.id !== r.round_id) {
          g = { id: r.round_id, round_number: r.round_number, round_total: r.round_total, items: [] };
          grouped.push(g);
        }
        g.items.push(r);
      }
      setRounds(grouped);
      setTotal(await getBillTotal(db, billId));
      setBillStatus(await getBillStatus(db, billId));
    } catch (error) {
      console.error('Error loading bill:', error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถโหลดข้อมูลบิลได้');
    } finally {
      setLoading(false);
    }
  }, [db, billId]);

  useFocusEffect(
    useCallback(() => {
      loadBill();
    }, [loadBill])
  );

  const handleCloseBill = () => {
    Alert.alert(
      'ปิดบิล',
      `ยืนยันปิดบิลโต๊ะ ${tableNumber} ยอดรวม ${(total / 100).toFixed(2)} บาท ?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ปิดบิล',
          style: 'destructive',
          onPress: async () => {
            try {
              await closeBill(db, billId);
              navigation.popToTop();
            } catch (error) {
              console.error('Close bill error:', error);
              Alert.alert('ผิดพลาด', 'ไม่สามารถปิดบิลได้');
            }
          },
        },
      ]
    );
  };

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
        <Text style={[styles.headerTitle, { flex: 1, textAlign: 'center' }]}>
          สรุปบิล โต๊ะ {tableNumber} {billStatus === 'closed' ? '(ปิดแล้ว)' : ''}
        </Text>
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
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemText}>x{it.quantity} {it.menu_name}</Text>
                  <Text style={styles.itemSub}>
                     {(it.price_at_order / 100).toFixed(2)} บาท{it.note ? ` · ${it.note}` : ''}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  {((it.quantity * it.price_at_order) / 100).toFixed(2)} บาท
                </Text>
              </View>
            ))}
            <View style={styles.sumRow}>
              <Text style={styles.sumText}>ยอดรวม</Text>
              <Text style={styles.sumValue}>{(round.round_total / 100).toFixed(2)} บาท</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>ยังไม่มีการสั่งอาหารในบิลนี้</Text>}
      />

      <View style={styles.totalBar}>
        <Text style={styles.totalLabel}>ยอดรวมทั้งหมด</Text>
        <Text style={styles.totalValue}>{(total / 100).toFixed(2)} บาท</Text>
      </View>

      {billStatus === 'open' && (
        <TouchableOpacity style={styles.closeBtn} onPress={handleCloseBill}>
          <Text style={styles.closeBtnText}>ปิดบิล</Text>
        </TouchableOpacity>
      )}
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
  itemSub: { 
    fontSize: 12, 
    color: '#64748b' 
  },
  closeBtn: { 
    backgroundColor: '#dc2626', 
    padding: 16, 
    alignItems: 'center' 
  },
  closeBtnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 },
});