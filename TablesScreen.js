import { useEffect, useState, useCallback } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

export default function TablesScreen({ navigation }) {
  const db = useSQLiteContext();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadTables = useCallback(async () => {
    setLoading(true);
    const rows = await db.getAllAsync(`
      SELECT
        t.id,
        t.table_number,
        MIN(b.id) AS bill_id,
        MAX(b.status) AS bill_status
      FROM tables t
      LEFT JOIN bills b ON b.table_id = t.id AND b.status = 'open'
      GROUP BY t.id, t.table_number
      ORDER BY t.table_number
    `);
    setTables(rows);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTables();
    });
    return unsubscribe;
  }, [navigation, loadTables]);

  const handlePressTable = async (item) => {
    if (processingId === item.id) return;

    try {
      setProcessingId(item.id);

      if (item.bill_id) {
        navigation.navigate('Menu', { billId: item.bill_id, tableNumber: item.table_number });
        return;
      }

      const existing = await db.getFirstAsync(
        "SELECT id FROM bills WHERE table_id = ? AND status = 'open' LIMIT 1",
        item.id
      );
      if (existing) {
        navigation.navigate('Menu', { billId: existing.id, tableNumber: item.table_number });
        return;
      }

      const now = new Date().toISOString();
      const result = await db.runAsync(
        'INSERT INTO bills (table_id, opened_at, status) VALUES (?, ?, ?)',
        item.id, now, 'open'
      );
      navigation.navigate('Menu', { billId: result.lastInsertRowId, tableNumber: item.table_number });
    } catch (error) {
      console.error('Error opening bill:', error);
      Alert.alert('ผิดพลาด', String(error.message || error));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
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
    />
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  list: { 
    padding: 8, 
    paddingTop: 50 
  },
  card: {
    flex: 1,
    margin: 6,
    minHeight: 80,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cardEmpty: { 
    backgroundColor: '#eaf7ea', 
    borderColor: '#8fd19e' 
  },
  cardOpen: { 
    backgroundColor: '#fdecea', 
    borderColor: '#e57373' 
  },
  tableNumber: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  status: { 
    fontSize: 13, 
    color: '#555', 
    marginTop: 4 
  },
});