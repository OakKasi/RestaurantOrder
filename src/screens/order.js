import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { COLORS } from "../styles/theme";
import { useCallback, useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { List_order, Update_Status, Clear_All_Order, cancel_item ,show_cancel} from "../db/db";

const status_config = {
    pending: { label: 'รอดำเนินการ', text: 'pending', color: COLORS.pending, bordercolor: COLORS.pendingBg },
    cooking: { label: 'กำลังปรุง', text: 'cooking', color: COLORS.cooking, bordercolor: COLORS.cookingBg },
    served: { label: 'เสริฟสำเร็จ', text: 'served', color: COLORS.served, bordercolor: COLORS.servedBg },
    cancel: { label: 'ยกเลิกแล้ว', text: 'cancelled', color: COLORS.red, bordercolor: COLORS.red }
};

function Order_Screen() {
    const db = useSQLiteContext();
    const [load, setLoading] = useState(false);
    const [order_item, setOrder_item] = useState([]);
    const [complete_order, setComplete_order] = useState([]);
    const [cancel_order, setCancel_order] = useState([]);

    const reload = useCallback(async () => {
        if (!db) return;
        setLoading(true);
        try {
            const order_db = await List_order(db);
            const order = order_db.filter((item) => item.status !== 'served' && item.status !== 'cancel');
            const order_s = order_db.filter((item) => item.status === 'served');
            const order_c =await show_cancel(db);
            setOrder_item(order);
            setComplete_order(order_s);
            setCancel_order(order_c);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }, [db]);

    useEffect(() => {
        reload();
    }, [reload]);

    const Update_status = async (id, current_status) => {
        if (current_status === 'served' || current_status === 'cancel') return;
        const next_status = current_status === 'pending' ? 'cooking' : 'served';
        await Update_Status(db, id, next_status);
        await reload();
    };

    const Clear_order = async (id,status,round_id, menu_item_id,quantity,note,price_at_order) => {
        if (status !== 'pending') {
            Alert.alert('ไม่สามารถยกเลิกออร์เดอร์ได้', 'ออเดอร์นี้อยู่ระหว่างการดำเนินการหรือเสร็จสิ้นแล้ว');
            return;
        }
        await cancel_item(db, id,round_id, menu_item_id,quantity,note,price_at_order);
        Alert.alert('การดำเนินการสำเร็จ', 'ยกเลิกออร์เดอร์เรียบร้อยแล้ว');
        await reload();
    };

    const Clear_all_order = async () => {
        Alert.alert('ลบออร์เดอร์ทั้งหมด', 'ออร์เดอร์ทั้งหมดจะถูกลบออกจากฐานข้อมูล', [
            { text: 'ยกเลิก', style: 'cancel' },
            {
                text: 'ลบทั้งหมด',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await Clear_All_Order(db);
                        await reload();
                    } catch (error) {
                        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบรายการทั้งหมดได้');
                    }
                }
            }
        ]);
    };

    const render_order = ({ item }) => {
        const theme = status_config[item.status] || status_config.pending;
        return (
            <View key={item.id} style={S.card}>
                <View style={[S.row, { paddingBottom: 10 }]}>
                    <Text style={S.id}>#{item.id}</Text>
                    <View style={S.tag}>
                        <Text style={{ color: theme.color }}>{theme.label}</Text>
                    </View>

                    <Text style={S.table_number}>
                        <Text style={{ color: COLORS.dim, fontSize: 16, fontWeight: '500' }}>โต๊ะ </Text>
                        {item.table}
                        <Text style={{ color: COLORS.dim, fontSize: 14, fontWeight: '400' }}> (รอบ {item.round_number})</Text>
                    </Text>
                    <Text style={[S.quantity, { marginHorizontal: 30 }]}>
                        <Text style={{ color: COLORS.dim, fontSize: 15, fontWeight: '400' }}>จำนวน : </Text>
                        {item.quantity}
                    </Text>
                </View>

                <View style={[S.row]}>
                    <Text style={[S.name]}>{item.name}</Text>
                    {item.status !== 'served' && item.status !== 'cancel' && (
                        <TouchableOpacity
                            style={[S.btn, { backgroundColor: theme.color, borderColor: theme.bordercolor }]}
                            onPress={() => Update_status(item.id, item.status)}
                        >
                            <Text style={S.btn_text}>{theme.text}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={[S.row, { justifyContent: 'space-between', marginTop: 10 }]}>
                    {item.note ? <Text style={S.note}>หมายเหตุ : {item.note}</Text> : <Text style={S.note}>{null}</Text>}
                    {item.status === 'pending' && (
                        <TouchableOpacity
                            style={[S.clear_btn, { width: 100 }]}
                            onPress={() => Clear_order(item.id,item.status,item.round_id, item.menu_item_id,item.quantity,item.note,item.price_at_order)}
                        >
                            <Text style={[S.clear_text, { paddingHorizontal: 20, paddingVertical: 10 }]}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={S.container}>
            <Text style={S.header}>Orders</Text>
            {!load ? (
                <>
                    <ScrollView contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
                        {order_item.length > 0 && (
                            <>
                                <Text style={[S.sectionTitle, { marginHorizontal: 20, marginVertical: 5 }]}>กำลังดำเนินการ</Text>
                                {order_item.map((item) => render_order({ item }))}
                            </>
                        )}
                        {complete_order.length > 0 && (
                            <>
                                <Text style={[S.sectionTitle, { marginHorizontal: 20, marginVertical: 10 }]}>รายการที่เสิร์ฟแล้ว</Text>
                                {complete_order.map((item) => render_order({ item }))}
                            </>
                        )}
                        {cancel_order.length > 0 && (
                            <>
                                <Text style={[S.sectionTitle, { marginHorizontal: 20, marginVertical: 10 }]}>รายการที่ยกเลิกแล้ว</Text>
                                {cancel_order.map((item) => render_order({ item }))}
                            </>
                        )}
                    </ScrollView>

                    <TouchableOpacity
                        style={[S.clear_btn, { marginHorizontal: 20, marginBottom: 10, paddingVertical: 12 }]}
                        onPress={Clear_all_order}
                    >
                        <Text style={S.clear_text}>ล้างออร์เดอร์ทั้งหมด (Clear All)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={reload}
                        disabled={load}
                        style={[S.reload_btn, { marginHorizontal: 20, marginBottom: 20, paddingVertical: 12 }]}
                    >
                        <Text style={S.reload_text}>
                            {load ? 'Loading...' : 'รีโหลด (Reload)'}
                        </Text>
                    </TouchableOpacity>
                </>
            ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0066cc" />
                    <Text style={{ color: COLORS.dim, fontSize: 16, fontWeight: '400', marginTop: 15 }}>
                        กำลังดึงข้อมูลออเดอร์...
                    </Text>
                </View>
            )}
        </View>
    );
}

const S = StyleSheet.create({
    header: {
        paddingTop: 10,
        fontSize: 26,
        fontWeight: '700',
        color: COLORS.text,
        paddingHorizontal: 24,
        paddingBottom: 10,
    },
    scrollContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    container: {
        backgroundColor: COLORS.bg,
        flex: 1,
    },
    card: {
        backgroundColor: COLORS.card,
        borderColor: COLORS.border,
        borderWidth: 1,
        marginHorizontal: 12,
        marginVertical: 6,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    name: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
    },
    id: {
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.dim,
        minWidth: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    note: {
        fontSize: 14,
        fontWeight: '400',
        color: COLORS.green,
        marginBottom: 4,
    },
    btn: {
        width: 100,
        padding: 8,
        borderRadius: 12,
        alignItems: 'center',
    },
    btn_text: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 2,
        textAlign: 'center',
    },
    tag: {
        paddingHorizontal: 5,
        paddingVertical: 5,
    },
    clear_btn: {
        borderWidth: 1,
        borderRadius: 12,
        borderColor: COLORS.red,
        alignItems: 'center',
    },
    clear_text: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.red,
        textAlign: 'center',
    },
    reload_btn: {
        borderWidth: 1,
        borderRadius: 12,
        borderColor: COLORS.green,
    },
    reload_text: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.green,
        textAlign: 'center',
    },
    table_number: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.dim,
    },
    quantity: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text,
        marginRight: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.cyan,
    },
});

export default Order_Screen;