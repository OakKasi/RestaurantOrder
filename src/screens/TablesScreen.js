import React, { useState, useCallback } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import {
  getTablesWithBillStatus,
  getOpenBillForTable,
  openNewBill,
  clearAllTransactionData,
} from '../db/db';

export default function TablesScreen({ navigation }) {
  const db = useSQLiteContext();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadTables = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await getTablesWithBillStatus(db);
      setTables(rows);
    } catch (error) {
      console.error('Error loading tables:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลโต๊ะได้');
    } finally {
      setLoading(false);
    }
  }, [db]);

  // โหลดข้อมูลโต๊ะใหม่ทุกครั้งที่กลับมาหน้านี้
  useFocusEffect(
    useCallback(() => {
      loadTables();
    }, [loadTables])
  );

  const handlePressTable = async (item) => {
    if (processingId === item.id) return;

    try {
      setProcessingId(item.id);

      // 1. กรณีมีบิลเปิดอยู่แล้ว
      if (item.bill_id) {
        navigation.navigate('MenuScreen', {
          billId: item.bill_id,
          tableNumber: item.table_number
        });
        return;
      }

      const existing = await getOpenBillForTable(db, item.id);
      if (existing) {
        navigation.navigate('MenuScreen', {
          billId: existing.id,
          tableNumber: item.table_number
        });
        return;
      }

      const newBillId = await openNewBill(db, item.id);
      navigation.navigate('MenuScreen', {
        billId: newBillId,
        tableNumber: item.table_number
      });
    } catch (error) {
      console.error('Error opening bill:', error);
      Alert.alert('ผิดพลาด', String(error.message || error));
    } finally {
      setProcessingId(null);
    }
  };

  // ปุ่มล้างข้อมูลการขายสำหรับผู้ตรวจ (ข้อกำหนด 4.1)
  const handleResetSalesData = () => {
    Alert.alert(
      ' ยืนยันการล้างข้อมูลการขาย',
      'ต้องการล้างประวัติการสั่งซื้อและบิลทั้งหมดเพื่อเริ่มทดสอบใหม่หรือไม่?\n(เมนูอาหารและโต๊ะจะไม่ถูกลบ)',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ยืนยันล้างข้อมูล',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllTransactionData(db);
              Alert.alert('สำเร็จ', 'ล้างข้อมูลการขายเรียบร้อยแล้ว');
              loadTables();
            } catch (err) {
              console.error('Error resetting sales data:', err);
              Alert.alert('ผิดพลาด', 'ไม่สามารถล้างข้อมูลได้');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tables}
        keyExtractor={(item) => String(item.id)}
        numColumns={3}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, item.bill_id ? styles.cardOpen : styles.cardEmpty]}
            onPress={() => handlePressTable(item)}
            disabled={processingId === item.id}
          >
            <Text style={styles.tableNumber}>โต๊ะ {item.table_number}</Text>
            <Text style={styles.status}>{item.bill_id ? 'มีบิลเปิดอยู่' : 'ว่าง'}</Text>
          </Pressable>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleResetSalesData}>
              <Text style={styles.resetBtnText}>ล้างข้อมูลการขายทั้งหมด </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 8, paddingBottom: 24 },
  card: {
    flex: 1,
    margin: 6,
    minHeight: 80,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cardEmpty: { backgroundColor: '#eaf7ea', borderColor: '#8fd19e' },
  cardOpen: { backgroundColor: '#fdecea', borderColor: '#e57373' },
  tableNumber: { fontSize: 18, fontWeight: 'bold' },
  status: { fontSize: 13, color: '#555', marginTop: 4 },
  footer: {
    marginTop: 20,
    paddingHorizontal: 8,
  },
  resetBtn: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: 14,
  },
});