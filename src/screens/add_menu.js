import { StyleSheet ,View,Text,TouchableOpacity,TextInput, ScrollView} from "react-native";
import { COLORS , TOPINSET} from "../styles/theme";
import { useState } from "react";
import { useSQLiteContext } from "expo-sqlite";

function Add_Menu_Screen(){
    const db=useSQLiteContext();
    const [type,setType]=useState('อาหารคาว');

    const render_type=(name)=>{
         return (
            <View key={name} style={{ marginVertical: 5 }}>
            <Text style={S.text}>{name}</Text>
             <ScrollView  horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.group}>
            {
                ['อาหารคาว','ของหวาน','เครื่องดื่ม','ของกินเล่น'].map((item)=>(
                     <TouchableOpacity key={item} style={[S.btn_type_unselect,item===type && S.btn_type_select]} onPress={()=>setType(item)}>
                        <Text style={[S.text_btn_unselect,item===type && S.text_btn_select]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
            ))
            }
            </ScrollView>
            </View>
        );
    }
    return(
        <View style={S.container}>
            <Text style={S.header}>Add Menu</Text>
                {
                ['Menu Name','Type','price','image'].map((item)=>{
                    return(
                        item==='Type' ? render_type(item) :
                    <View key={item} style={{marginVertical:5}}>
                    <Text style={S.text}>{item}</Text>
                    <TextInput style={S.text_input}/>
                    </View>
                    );
                })
                }
                <TouchableOpacity>
                    <Text style={{color:'white',alignItems:'center'}}>เพิ่มเมนูอาหาร</Text>
                </TouchableOpacity>
        </View>
    )
}

const S=StyleSheet.create({
   container:{
    flex:1,
    backgroundColor:COLORS.bg,
    paddingTop:10+TOPINSET
   },
   header:{
    fontSize:26,
    fontWeight:'700',
    color:COLORS.text,
    paddingHorizontal:24,
    paddingBottom:10
   },
   text_input:{
    borderWidth:1,
    borderColor:COLORS.border,
    borderRadius:10,
    marginHorizontal:20,
    marginVertical:10
   },
   text:{
    fontSize:16,
    fontWeight:'500',
    color:COLORS.dim,
    marginHorizontal:20
   },
   btn_type_select:{
    borderRadius:15,
    borderColor:COLORS.border,
    borderWidth:1,
    backgroundColor:COLORS.cyan,
   },
   text_btn_select:{
    fontSize:16,
    fontWeight:'500',
    color:COLORS.text,
    textAlign:'center'
   },
   btn_type_unselect:{
    borderRadius:15,
    borderColor:COLORS.border,
    borderWidth:1,
   },
   text_btn_unselect:{
    fontSize:16,
    fontWeight:'500',
    color:COLORS.cyan,
    textAlign:'center',
    marginHorizontal:20,
    marginVertical:10,
   },
   group:{
    flexDirection:'row',
    gap:10,
    //textAlign:'center',
    marginHorizontal:20,
    marginVertical:10
   },
});

export default Add_Menu_Screen;