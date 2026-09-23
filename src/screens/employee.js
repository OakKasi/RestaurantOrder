import { StyleSheet ,View,Text,TouchableOpacity} from "react-native";
import { COLORS , TOPINSET} from "../styles/theme";

function Employee(){
    const order = [
    { id: '1', name: 'ข้าวผัด', note:'ไม่ใส่เเครอท'},
    { id: '2', name: 'ยำวุ้นเส้น', note:'เผ็ดน้อย หวานเปรี้ยว'},
    { id: '3', name: 'ก๋วยเตี๋ยวไก่', note: null},
    ];

    //ปุ่มกดเเล้วเปลี่ยนสัเปลี่ยนคำเปลี่ยนสถานะ
    if(!order) return null;
    return(
        <View style={S.container}>
            <Text style={S.header}>Oreders</Text>
            {order.map((item)=>(
                <View style={S.card}>
                    <View style={[S.row]}>
                        <Text style={S.id}>#{item.id}</Text>
                        <View style={S.tag}>
                            <Text style={{color:COLORS.cyan}}>กำลังปรุงอาหาร</Text>
                        </View>
                    </View>
                    
                    <View style={[S.row]}>
                        <Text style={S.name}>{item.name}</Text>
                        <TouchableOpacity style={S.btn}>
                            <Text style={S.btn_text}>พร้อมเสริฟ</Text>
                        </TouchableOpacity>
                    </View>
                    {item.note ? <Text style={S.note}>note : {item.note}</Text> :<Text style={S.note}>{null}</Text>}
                </View>
            ))}
        </View>
    )
}

const S=StyleSheet.create({
    header:{
        fontSize:26,
        fontWeight:'700',
        color:COLORS.cyan,
        paddingHorizontal:24,
        paddingBottom:10
    },
    container:{
        backgroundColor:COLORS.bg,
        flex:1,
        paddingTop:TOPINSET+10
    },
    card:{
        backgroundColor:COLORS.card,
        borderBlockColor:COLORS.border,
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
        fontWeight:'500',
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
        color:COLORS.red,
        marginBottom:10
    },
    btn:{
        padding:10,
        backgroundColor:COLORS.green,
        borderRadius:15,
    },
    btn_text:{
        fontSize:16,
        fontWeight:'500',
        color:COLORS.text,
    },
    tag:{
      paddingHorizontal:5,
      paddingVertical:5 
    }
});
export default Employee;