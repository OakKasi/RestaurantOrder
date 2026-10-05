<<<<<<< Updated upstream
import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, FlatList } from "react-native";
import { COLORS, TOPINSET } from "../styles/theme";
import { useCallback, useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { List_order, Update_Status, Clear_Order, Clear_All_Order } from "../db/db";
const status_config = {
    pending: { label: 'รอดำเนินการ', text: 'pending', color: COLORS.pending, bordercolor: COLORS.pendingBg },
    cooking: { label: 'กำลังปรุง', text: 'cooking', color: COLORS.cooking, bordercolor: COLORS.cookingBg },
    served: { label: 'เสริฟสำเร็จ', text: 'served', color: COLORS.served, bordercolor: COLORS.servedBg }
}
function Order_Screen() {
    const db = useSQLiteContext();
    const [load, setLoading] = useState(false); //เพิ่มโหลดให้หน่อยนะ ง่วงเเล้ว ลืมทำ 
    const [rows, setRows] = useState([]);

    const reload = useCallback(async () => {
=======
import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, FlatList, Alert,ScrollView } from "react-native";
import { COLORS, TOPINSET } from "../styles/theme";
import { useCallback, useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { List_order, Update_Status, Clear_Order, Clear_All_Order,cancel_item } from "../db/db";
const status_config = {
    pending: { label: 'รอดำเนินการ', text: 'pending', color: COLORS.pending, bordercolor: COLORS.pendingBg },
    cooking: { label: 'กำลังปรุง', text: 'cooking', color: COLORS.cooking, bordercolor: COLORS.cookingBg },
    served: { label: 'เสริฟสำเร็จ', text: 'served', color: COLORS.served, bordercolor: COLORS.servedBg },
    cancel: { label: 'ยกเลิกแล้ว', text: 'cancelled', color: COLORS.red, bordercolor: COLORS.red }
}
function Order_Screen() {
    const db = useSQLiteContext();
    const [load, setLoading] = useState(false);
    const [order_item,setOrder_item]=useState([]);
    const [complete_order,setComplete_order]=useState([]);
    const [cancel_order,setCancel_order]=useState([]);
    const reload = useCallback(async () => {
        if (!db) return;
>>>>>>> Stashed changes
        setLoading(true);
        const order_db=await List_order(db);
        const order=(order_db.filter((item) => item.status !== 'served' && item.status !=='cancel'));
        const order_s=(order_db.filter((item) => item.status === 'served'));
        const order_c=(order_db.filter((item) => item.status === 'cancel'));
        setOrder_item(order);
        setComplete_order(order_s);
        setCancel_order(order_c);
        setLoading(false);
    }, [db]);

    useEffect(() => {
        reload();
    }, [reload])

    const render_order = ({ item }) => {
<<<<<<< Updated upstream
        const theme = status_config[item.status] || status_config.pending;
=======
        const theme = status_config[item.status];
>>>>>>> Stashed changes
        return (
            <View key={item.id} style={S.card}>
                <View style={[S.row, { paddingBottom: 10 }]}>
                    <Text style={S.id}>#{item.id}</Text>
                    <View style={S.tag}>
                        <Text style={{ color: theme.color }}>{theme.label}</Text>
                    </View>

                    <Text style={S.table_number}>
                        <Text style={{ color: COLORS.dim, fontSize: 16, fontWeight: '500' }}>โต๊ะ  </Text>
                        {item.table}
<<<<<<< Updated upstream
                        <Text style={{ color: COLORS.dim, fontSize: 14, fontWeight: '400' }}> (รอบ {item.round_number})</Text>
                    </Text>
                    <Text style={[S.price, { marginLeft: 100 }]}>
                        <Text style={{ color: COLORS.dim, fontSize: 15, fontWeight: '400' }}>price  :  </Text>
                        {item.price}
=======
                        <Text style={{ color: COLORS.dim, fontSize: 14, fontWeight: '400' }}>  (รอบ {item.round_number})</Text>
                    </Text>
                    <Text style={[S.quantity,{marginHorizontal:30}]}>
                        <Text style={{ color: COLORS.dim, fontSize: 15, fontWeight: '400' }}>quantity  :  </Text>
                        {item.quantity}
>>>>>>> Stashed changes
                    </Text>
                </View>

                <View style={[S.row]}>
<<<<<<< Updated upstream
                    <Text style={S.name}>{item.name}</Text>
                    <Text style={S.quantity}>
                        <Text style={{ color: COLORS.dim, fontSize: 15, fontWeight: '400' }}>quantity  :  </Text>
                        {item.quantity}
                    </Text>
=======
                    <Text style={[S.name]}>{item.name}</Text>
                    
>>>>>>> Stashed changes
                    <TouchableOpacity style={[S.btn, { backgroundColor: theme.color, borderColor: theme.bordercolor }]} onPress={() => Update_status(item.id, item.status)}>
                        <Text style={S.btn_text}>{theme.text}</Text>
                    </TouchableOpacity>
                </View>
                <View style={[S.row, { justifyContent: 'space-between', marginTop: 10 }]}>
                    {item.note ? <Text style={S.note}>note : {item.note}</Text> : <Text style={S.note}>{null}</Text>}
<<<<<<< Updated upstream
                    <TouchableOpacity style={[S.clear_btn, { width: 100 }]} onPress={() => Clear_order(item.id)}>
                        <Text style={[S.clear_text, { paddingHorizontal: 20, paddingVertical: 10 }]}>Clear</Text>
                    </TouchableOpacity>
=======
                    {
                    item.status==='served'||item.status==='cancel' ? null :
                    <TouchableOpacity style={[S.clear_btn, { width: 100 }]} onPress={() => Clear_order(item.id,item.status)}>
                        <Text style={[S.clear_text, { paddingHorizontal: 20, paddingVertical: 10 }]}>Cancel</Text>
                    </TouchableOpacity>
                    }
>>>>>>> Stashed changes
                </View>
            </View>
        )
    }

    const Update_status = async (id, current_status) => {
        const next_status = current_status === 'pending' ? 'cooking' : current_status === 'cooking' ? 'served' : 'served';
        await Update_Status(db, id, next_status);
        await reload();
    }

<<<<<<< Updated upstream
    const Clear_order = async (id) => {
        await Clear_Order(db, id);
        await reload();
    }
    const Clear_all_order = async () => {
        await Clear_All_Order(db);
        await reload();
=======
    const Clear_order = async (id,status) => {
        if(status!=='pending'){
            Alert.alert('ไม่สามารถยกเลิกออร์เดอร์ได้','ออเดอร์นี้อยู่ระหว่างการดำเนินการ');
            return;
        }
        await cancel_item(db,id);
        Alert.alert('การดำเนินการสำเร็จ','ยกเลิกออร์เดอร์เเล้ว');
        await reload();
    }
    const Clear_all_order = async () => {
        Alert.alert('ลบออร์เดอร์ทั้งหมด','ออร์เดอร์ทั้งหมดจะถูกลบออกจากdatabase',[
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
        ])
>>>>>>> Stashed changes
    }
    return (
        <View style={S.container}>
            <Text style={S.header}>Orders</Text>
            {
<<<<<<< Updated upstream
                !load ? <>
                    <FlatList
                        data={rows}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={render_order}
                    />
                    <TouchableOpacity style={[S.clear_btn, { marginHorizontal: 20, marginBottom: 20, paddingVertical: 15 }]} onPress={() => Clear_all_order()}>
=======
                !load ?
                <>
                    <ScrollView contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
                    { order_item.length >0 && (
                        <>
                            <Text style={[S.quantity, { marginHorizontal: 30, marginVertical: 5 }]}>กำลังดำเนินการ</Text>
                        {order_item.map((item) => render_order({ item }))}
                        </>
                    )}
                    <Text style={[S.quantity,{marginHorizontal:30,marginVertical:5}]}>รายการที่เสริฟเเล้ว</Text>
                    {complete_order.map((item) => render_order({item}))}
                    <Text style={[S.quantity,{marginHorizontal:30,marginVertical:5}]}>รายการที่ยกเลิกเเล้ว</Text>
                    {cancel_order.map((item) => render_order({item}))}
                </ScrollView> 
                <TouchableOpacity style={[S.clear_btn, { marginHorizontal: 20, marginBottom: 20, paddingVertical: 15 }]} onPress={() => Clear_all_order()}>
>>>>>>> Stashed changes
                        <Text style={S.clear_text}>Clear All Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={reload}
                        disabled={load}
                        style={[S.reload_btn, { marginHorizontal: 20, marginBottom: 20, paddingVertical: 15 }]}
                    >
                        <Text style={S.reload_text}>
                            {load ? 'Loading...' : 'Reload'}
                        </Text>
                    </TouchableOpacity>
<<<<<<< Updated upstream
                </> : <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0066cc" />
                    <Text style={{ color: COLORS.dim, fontSize: 16, fontWeight: '400', marginTop: 15 }}>กำลังดึงข้อมูลออเดอร์จากบานข้อมูล</Text>
=======
                    </>
                : <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0066cc" />
                    <Text style={{ color: COLORS.dim, fontSize: 16, fontWeight: '400', marginTop: 15 }}>กำลังดึงข้อมูลออเดอร์</Text>
>>>>>>> Stashed changes
                </View>
            }
        </View>
    )
}

const S = StyleSheet.create({
    header: {
<<<<<<< Updated upstream
=======
        paddingTop: 10,
>>>>>>> Stashed changes
        fontSize: 26,
        fontWeight: '700',
        color: COLORS.text,
        paddingHorizontal: 24,
        paddingBottom: 10
    },
<<<<<<< Updated upstream
    container: {
        backgroundColor: COLORS.bg,
        flex: 1,
        paddingTop: TOPINSET + 10,
        justifyContent: 'space-between'
    },
    card: {
        backgroundColor: COLORS.card,
        borderColor: COLORS.border,
        borderWidth: 1,
        marginHorizontal: 20,
        marginVertical: 7,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    name: {
        flex: 1,
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.text
    },
=======
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
        marginHorizontal: 20,
        marginVertical: 7,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    name: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text
    },
>>>>>>> Stashed changes
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
        marginBottom: 10
    },
    btn: {
        width: 100,
        padding: 10,
        borderRadius: 15,
        alignItems: 'center'
    },
    btn_text: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 2,
        textAlign: 'center'
    },
    tag: {
        paddingHorizontal: 5,
        paddingVertical: 5
    },
    clear_btn: {
        borderWidth: 1,
        borderRadius: 15,
        borderColor: COLORS.red,
    },
    clear_text: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.red,
        textAlign: 'center'
    },
    reload_btn: {
        borderWidth: 1,
        borderRadius: 15,
        borderColor: COLORS.green,
    },
    reload_text: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.green,
        textAlign: 'center'
<<<<<<< Updated upstream
    },
    table_number: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.dim
    },
    quantity: {
        fontSize: 20,
        fontWeight: '500',
        color: COLORS.text,
        marginRight: 20
    },
    price: {
        fontSize: 20,
        fontWeight: '500',
        color: COLORS.dim,
        marginRight: 20
    }
=======
    },
    table_number: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.dim
    },
    quantity: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text,
        marginRight: 20
    },
    price: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.dim,
        marginRight: 20
    },
>>>>>>> Stashed changes
});

export default Order_Screen;