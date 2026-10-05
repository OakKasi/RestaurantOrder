import { useState, useCallback, useLayoutEffect } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { getTablesWithOpenBill, getOrCreateOpenBill, clearAllTransactionData } from '../db/db';

export default function TablesScreen({ navigation }) {
  const db = useSQLiteContext();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => navigation.navigate('BillHistoryScreen')}
            style={{ paddingHorizontal: 8, paddingVertical: 5, marginRight: 8 }}
          >
            <Text style={{ color: '#0284c7', fontWeight: 'bold', fontSize: 16 }}>ประวัติ</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('KitchenScreen')}
            style={{ paddingHorizontal: 8, paddingVertical: 5 }}
          >
            <Text style={{ color: '#0284c7', fontWeight: 'bold', fontSize: 16 }}>ครัว</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  const loadTables = useCallback(async () => {
    setLoading(true);
    try {
      setTables(await getTablesWithOpenBill(db));
    } catch (error) {
      console.error('Error loading tables:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลโต๊ะได้');
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadTables();
    }, [loadTables])
  );

  const handlePressTable = async (item) => {
    if (processingId === item.id) return;

    try {
      setProcessingId(item.id);
      const billId = item.bill_id ?? (await getOrCreateOpenBill(db, item.id));
      navigation.navigate('MenuScreen', {
        billId,
        tableNumber: item.table_number,
      });
    } catch (error) {
      console.error('Error opening bill:', error);
      Alert.alert('ผิดพลาด', String(error.message || error));
    } finally {
      setProcessingId(null);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'ล้างข้อมูลการขาย',
      'บิล รอบการสั่ง และรายการที่สั่งทั้งหมดจะถูกลบ (เมนูและโต๊ะยังอยู่) ยืนยันหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ล้างข้อมูล',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllTransactionData(db);
              await loadTables();
              Alert.alert('สำเร็จ', 'ล้างข้อมูลการขายเรียบร้อยแล้ว');
            } catch (error) {
              console.error('Clear data error:', error);
              Alert.alert('ผิดพลาด', 'ไม่สามารถล้างข้อมูลได้');
            }
          },
        },
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
        <View>
          <View style={styles.footerRow}>
            <Pressable
              style={styles.footerBtn}
              onPress={() => navigation.navigate('SalesSummaryScreen')}
            >
              <Text style={styles.footerBtnText}>สรุปยอดขาย</Text>
            </Pressable>
            <Pressable
              style={styles.footerBtn}
              onPress={() => navigation.navigate('MenuSettingsScreen')}
            >
              <Text style={styles.footerBtnText}>ตั้งค่าเมนู</Text>
            </Pressable>
          </View>
          <Pressable style={styles.clearBtn} onPress={handleClearData}>
            <Text style={styles.clearBtnText}>ล้างข้อมูลการขายทั้งหมด</Text>
          </Pressable>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 8 },
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
  footerRow: { flexDirection: 'row', marginHorizontal: 6, marginTop: 8 },
  footerBtn: {
    flex: 1,
    margin: 6,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0284c7',
    alignItems: 'center',
  },
  footerBtnText: { color: '#fff', fontWeight: 'bold' },
  clearBtn: {
    margin: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
    alignItems: 'center',
  },
  clearBtnText: { color: '#dc2626', fontWeight: 'bold' },
});