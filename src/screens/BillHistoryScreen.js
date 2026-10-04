import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { getClosedBills } from '../db/db';

export default function BillHistoryScreen({ navigation }) {
    const db = useSQLiteContext();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadHistory = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getClosedBills(db);
            setBills(data);
        } catch (error) {
            console.error('Error loading bill history:', error);
        } finally {
            setLoading(false);
        }
    }, [db]);

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [loadHistory])
    );

    const formatDate = (isoString) => {
        if (!isoString) return '-';
        const d = new Date(isoString);
        return `${d.toLocaleDateString('th-TH')} ${d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`;
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
                data={bills}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() =>
                            navigation.navigate('BillSummaryScreen', {
                                billId: item.id,
                                tableNumber: item.table_number,
                                isClosed: true,
                            })
                        }
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.tableText}>โต๊ะ {item.table_number}</Text>
                            <Text style={styles.totalText}>{(item.total_stang / 100).toFixed(2)} บาท</Text>
                        </View>
                        <View style={styles.cardFooter}>
                            <Text style={styles.dateText}>บิล #{item.id}</Text>
                            <Text style={styles.dateText}>ปิดเมื่อ: {formatDate(item.closed_at)}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Text style={{ color: '#888', fontSize: 16 }}>ยังไม่มีประวัติบิลที่ปิดแล้ว</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f4' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    tableText: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
    totalText: { fontSize: 18, fontWeight: 'bold', color: '#16a34a' },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderColor: '#f1f5f9',
        paddingTop: 8,
    },
    dateText: { fontSize: 13, color: '#64748b' },
});
