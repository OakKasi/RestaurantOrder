import { ActivityIndicator,StyleSheet, View, Text, TouchableOpacity, FlatList } from "react-native";
import { COLORS } from "../styles/theme";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { selling } from "../db/db";

function Dashboard_Screen() {
    const db = useSQLiteContext();
    const [catagory,setCatagory]=useState(null);
    const [loading,setLoading]=useState(false);

    useEffect(()=>{
        setLoading(true);
        const selling_today=async()=>{
        const response=await selling(db);
        setCatagory(response);
        }
        selling_today();
        setLoading(false);
    },[db])
    
    const render_dash=({item})=>{
        const isall=item.name==='ยอดขายรวมทั้งหมด';
        return(
                <View style={[S.card,isall && S.all_card]}>
                    <Text style={S.type}>{item.name}</Text>
                    <Text style={S.price}>{item.price?.toLocaleString()} THB</Text>
                </View>
        )
    }
    return(
        <View style={S.container}>
            <Text style={S.header}>Dashboard</Text>
            {
                loading ? (
                    <ActivityIndicator size="large" color={COLORS.cyan}/>
                ): (
                    <FlatList
                    data={catagory}
                    keyExtractor={(item) => item.name.toString()}
                    renderItem={render_dash}
                    />
                )
            }
        </View>
    )
}
const S = StyleSheet.create({
    header:{
        fontSize:30,
        color:COLORS.text,
        paddingVertical:20,
        fontWeight:'600',
        paddingHorizontal:20
    },
    container:{
        flex:1,
        backgroundColor:COLORS.bg,
    },
    type:{
        fontSize:20,
        color:COLORS.cyan,
        fontWeight:'400',
        marginBottom:10,
        marginHorizontal:15,
        marginVertical:15
    },
    price:{
        fontSize:26,
        color:COLORS.text,
        textAlign:'right',
        fontWeight:'700',
        marginHorizontal:15,
        marginBottom:15
    },
    all_card:{
        backgroundColor:COLORS.card,
        borderColor:COLORS.cyan,
        borderRadius:10,
        borderWidth:1,
        marginVertical:5,
        marginHorizontal:20,
    },
    card:{
        backgroundColor:COLORS.card,
        borderColor:COLORS.border,
        borderRadius:10,
        borderWidth:1,
        marginVertical:5,
        marginHorizontal:20,
    },
});

export default Dashboard_Screen;