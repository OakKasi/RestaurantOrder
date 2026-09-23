import { ActivityIndicator,StyleSheet ,View,Text,TouchableOpacity,FlatList} from "react-native";
import { COLORS , TOPINSET} from "../styles/theme";
import { useCallback, useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { List_order ,Update_Status,Clear_Order,Clear_All_Order} from "../db/db";
    const status_config={
        pending:{label: 'รอดำเนินการ',text:'pending', color:COLORS.pending, bordercolor:COLORS.pendingBg},
        cooking:{label: 'กำลังปรุง',text:'cooking', color:COLORS.cooking, bordercolor:COLORS.cookingBg},
        served:{label: 'เสริฟสำเร็จ',text:'served', color:COLORS.served, bordercolor:COLORS.servedBg}
    }
function Order_Screen(){
    const db=useSQLiteContext();
    const [load,setLoading]=useState(false); //เพิ่มโหลดให้หน่อยนะ ง่วงเเล้ว ลืมทำ 
    const [rows,setRows]=useState([]);

    const reload=useCallback(async()=>{
        setLoading(true);
        setRows(await List_order(db));
        setLoading(false);
    },[db]);

    useEffect(()=>{
        reload();
    },[reload])

    const render_order=({item})=>{
        const theme=status_config[item.status]||status_config.pending;
                return  (
                     <View key={item.id} style={S.card}>
                    <View style={[S.row,{paddingBottom:10}]}>
                        <Text style={S.id}>#{item.id}</Text>
                        <View style={S.tag}>
                            <Text style={{color:theme.color}}>{theme.label}</Text>
                        </View>
                        
                        <Text style={S.table_number}>
                            <Text style={{color:COLORS.dim,fontSize:16,fontWeight:'500'}}>โต๊ะ  </Text>
                            {item.table}
                        </Text>
                        <Text style={[S.price,{marginLeft:100}]}>
                            <Text style={{color:COLORS.dim,fontSize:15,fontWeight:'400'}}>price  :  </Text>
                            {item.price}
                        </Text>
                    </View>
                    
                    <View style={[S.row]}>
                        <Text style={S.name}>{item.name}</Text>
                        <Text style={S.quantity}>
                            <Text style={{color:COLORS.dim,fontSize:15,fontWeight:'400'}}>quantity  :  </Text>
                            {item.quantity}
                        </Text>
                        <TouchableOpacity style={[S.btn,{backgroundColor:theme.color,borderColor:theme.bordercolor}]} onPress={()=>Update_status(item.id,item.status)}>
                            <Text style={S.btn_text}>{theme.text}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[S.row,{justifyContent:'space-between',marginTop:10}]}>
                        {item.note ? <Text style={S.note}>note : {item.note}</Text> :<Text style={S.note}>{null}</Text>}
                        <TouchableOpacity style={[S.clear_btn,{width: 100}]} onPress={()=>Clear_order(item.id)}>
                            <Text style={[S.clear_text,{paddingHorizontal:20,paddingVertical:10}]}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                </View> 
                )
    }

    const Update_status=async(id,current_status)=>{
        const next_status= current_status === 'pending' ? 'cooking' :current_status ==='cooking' ? 'served' : 'served';
        await Update_Status(db,id,next_status);
        await reload();
    }

    const Clear_order=async(id)=>{
        await Clear_Order(db,id);
        await reload();
    }
    const Clear_all_order=async()=>{
        await Clear_All_Order(db);
        await reload();
    }
    return(
        <View style={S.container}>
            <Text style={S.header}>Orders</Text>
            {
                !load ? <>
                <FlatList
                data={rows}
                keyExtractor={(item)=>item.id.toString()}
                renderItem={render_order}
                />
                <TouchableOpacity style={[S.clear_btn,{marginHorizontal:20, marginBottom:20,paddingVertical:15}]} onPress={()=>Clear_all_order()}>
                    <Text style={S.clear_text}>Clear All Order</Text>
                </TouchableOpacity> 
                </>: <View style={{justifyContent:'center',alignItems:'center'}}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={{color:COLORS.dim,fontSize:16,fontWeight:'400',marginTop:15}}>กำลังดึงข้อมูลออเดอร์จากบานข้อมูล</Text>
                </View>
            }
        </View>
    )
}

const S=StyleSheet.create({
    header:{
        fontSize:26,
        fontWeight:'700',
        color:COLORS.text,
        paddingHorizontal:24,
        paddingBottom:10
    },
    container:{
        backgroundColor:COLORS.bg,
        flex:1,
        paddingTop:TOPINSET+10,
        justifyContent:'space-between'
    },
    card:{
        backgroundColor:COLORS.card,
        borderColor:COLORS.border,
        borderWidth:1,
        marginHorizontal:20,
        marginVertical:7,
        borderRadius:20,
        paddingHorizontal:20,
        paddingVertical:10
    },
    name:{
        flex: 1, 
        fontSize:20,
        fontWeight:'600',
        color:COLORS.text
    },
    id:{
        fontSize:14,
        fontWeight:'400',
        color:COLORS.dim,
        minWidth: 20,
    },
    row:{
        flexDirection:'row',
        alignItems:'center',
    },
    note:{
        fontSize:14,
        fontWeight:'400',
        color:COLORS.green,
        marginBottom:10
    },
    btn:{
        width: 100,
        padding:10,
        borderRadius:15,
        alignItems:'center'
    },
    btn_text:{
        fontSize:14,
        fontWeight:'500',
        color: '#FFFFFF',
        paddingHorizontal:10,
        paddingVertical:2,
        textAlign:'center'
    },
    tag:{
      paddingHorizontal:5,
      paddingVertical:5 
    },
    clear_btn:{
        borderWidth:1,
        borderRadius:15,
        borderColor:COLORS.red,
    },
    clear_text:{
        fontSize:14,
        fontWeight:'500',
        color:COLORS.red,
        textAlign:'center'
    },
    table_number:{ 
        fontSize:20,
        fontWeight:'700',
        color:COLORS.dim
    },
    quantity:{
        fontSize:20,
        fontWeight:'500',
        color:COLORS.text,
        marginRight:20
    },
    price:{
        fontSize:20,
        fontWeight:'500',
        color:COLORS.dim,
        marginRight:20
    }
});

export default Order_Screen;