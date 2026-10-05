import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { COLORS, TOPINSET } from "../styles/theme";
import { useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { getCategories, Add_MenuItem } from "../db/db";

function Add_Menu_Screen({ navigation }) {
  const db = useSQLiteContext();
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await getCategories(db);
      setCategories(cats);
      if (cats && cats.length > 0) {
        setSelectedCatId(cats[0].id);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handle_add_menu = async () => {
    if (!name.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อเมนูอาหาร');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกราคาให้ถูกต้อง (มากกว่า 0)');
      return;
    }
    if (!selectedCatId) {
      Alert.alert('แจ้งเตือน', 'กรุณาเลือกหมวดหมู่อาหาร');
      return;
    }

    try {
      // แปลงราคาบาทเป็นหน่วยสตางค์ (Satang) เพื่อตรงกับ schema ฐานข้อมูล (INTEGER)
      // และไม่กระทบต่อ mock data 30 กว่าเมนูเดิม
      const priceInSatang = Math.round(numPrice * 100);
      await Add_MenuItem(db, selectedCatId, name.trim(), priceInSatang, imageUrl.trim());

      Alert.alert('สำเร็จ', `เพิ่มเมนู "${name.trim()}" เรียบร้อยแล้ว`, [
        {
          text: 'ตกลง',
          onPress: () => {
            setName('');
            setPrice('');
            setImageUrl('');
            if (navigation?.goBack) {
              navigation.goBack();
            }
          }
        }
      ]);
    } catch (error) {
      console.error('Error adding menu:', error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถเพิ่มเมนูได้: ' + String(error.message || error));
    }
  };

  const render_type = (label) => {
    return (
      <View key={label} style={{ marginVertical: 5 }}>
        <Text style={S.text}>{label}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.group}>
          {
            categories.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[S.btn_type_unselect, item.id === selectedCatId && S.btn_type_select]}
                onPress={() => setSelectedCatId(item.id)}
              >
                <Text style={[S.text_btn_unselect, item.id === selectedCatId && S.text_btn_select]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))
          }
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={S.container}>
      <Text style={S.header}>Add Menu</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {
          ['Menu Name', 'Type', 'price', 'image'].map((item) => {
            if (item === 'Type') {
              return render_type(item);
            }

            let val = name;
            let setter = setName;
            let placeholder = 'กรอกชื่อเมนูอาหาร';
            let keyboard = 'default';

            if (item === 'price') {
              val = price;
              setter = setPrice;
              placeholder = 'เช่น 60 หรือ 65.50';
              keyboard = 'numeric';
            } else if (item === 'image') {
              val = imageUrl;
              setter = setImageUrl;
              placeholder = 'URL รูปภาพ (ถ้ามี)';
            }

            return (
              <View key={item} style={{ marginVertical: 5 }}>
                <Text style={S.text}>{item}</Text>
                <TextInput
                  style={S.text_input}
                  value={val}
                  onChangeText={setter}
                  placeholder={placeholder}
                  placeholderTextColor={COLORS.dim}
                  keyboardType={keyboard}
                />
              </View>
            );
          })
        }
        <TouchableOpacity style={S.btn_submit} onPress={handle_add_menu}>
          <Text style={S.text_btn_submit}>เพิ่มเมนูอาหาร</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: 10 + TOPINSET
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 24,
    paddingBottom: 10
  },
  text_input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    fontSize: 16
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.dim,
    marginHorizontal: 20
  },
  btn_type_select: {
    borderRadius: 15,
    borderColor: COLORS.border,
    borderWidth: 1,
    backgroundColor: COLORS.cyan,
  },
  text_btn_select: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center'
  },
  btn_type_unselect: {
    borderRadius: 15,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  text_btn_unselect: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.cyan,
    textAlign: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  group: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginVertical: 10
  },
  btn_submit: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  text_btn_submit: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default Add_Menu_Screen;