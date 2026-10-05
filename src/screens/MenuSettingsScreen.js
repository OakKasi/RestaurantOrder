import { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, SectionList, TouchableOpacity, TextInput, Modal, Switch, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { getCategories, getAllMenuItems, Add_MenuItem, updateMenuItemPrice, setMenuItemAvailability } from '../db/db';

const parsePriceToSatang = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const baht = Number(trimmed);
  if (!Number.isFinite(baht) || baht < 0) return null;
  return Math.round(baht * 100);
};

export default function MenuSettingsScreen({ navigation }) {
  const db = useSQLiteContext();
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);

  const [modal, setModal] = useState(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCatId, setFormCatId] = useState(null);

  const loadMenu = useCallback(async () => {
    try {
      const cats = await getCategories(db);
      setCategories(cats);
      const items = await getAllMenuItems(db);
      setSections(
        cats.map((cat) => ({
          title: cat.name,
          data: items.filter((it) => it.category_id === cat.id),
        }))
      );
    } catch (error) {
      console.error('Error loading menu settings:', error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถโหลดเมนูได้');
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadMenu();
    }, [loadMenu])
  );

  const openAdd = useCallback(() => {
    setFormName('');
    setFormPrice('');
    setFormCatId(categories.length > 0 ? categories[0].id : null);
    setModal({ mode: 'add' });
  }, [categories]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={openAdd} style={{ paddingHorizontal: 8, paddingVertical: 5 }}>
          <Text style={{ color: '#0284c7', fontWeight: 'bold', fontSize: 16 }}>+ เพิ่มเมนู</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, openAdd]);

  const openEdit = (item) => {
    setFormPrice(String(item.price / 100));
    setModal({ mode: 'edit', item });
  };

  const handleSave = async () => {
    const price = parsePriceToSatang(formPrice);
    if (price === null) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกราคาเป็นตัวเลขที่ไม่ติดลบ');
      return;
    }

    try {
      if (modal.mode === 'add') {
        const name = formName.trim();
        if (!name) {
          Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อเมนู');
          return;
        }
        if (formCatId === null) {
          Alert.alert('แจ้งเตือน', 'กรุณาเลือกหมวดหมู่');
          return;
        }
        await Add_MenuItem(db, formCatId, name, price, '');
      } else {
        await updateMenuItemPrice(db, modal.item.id, price);
      }
      setModal(null);
      await loadMenu();
    } catch (error) {
      console.error('Save menu error:', error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกได้');
    }
  };

  const handleToggle = async (item, value) => {
    try {
      await setMenuItemAvailability(db, item.id, value);
      await loadMenu();
    } catch (error) {
      console.error('Toggle availability error:', error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถเปลี่ยนสถานะเมนูได้');
    }
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => openEdit(item)}>
              <Text style={[styles.name, !item.is_available && styles.nameOff]}>{item.name}</Text>
              <Text style={styles.price}>
                {(item.price / 100).toFixed(2)} บาท · แตะเพื่อแก้ราคา
              </Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Switch
                value={!!item.is_available}
                onValueChange={(value) => handleToggle(item, value)}
              />
              <Text style={styles.switchLabel}>{item.is_available ? 'พร้อมขาย' : 'ปิดขาย'}</Text>
            </View>
          </View>
        )}
      />

      <Modal visible={modal !== null} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>
              {modal?.mode === 'add' ? 'เพิ่มเมนูใหม่' : `แก้ราคา: ${modal?.item?.name ?? ''}`}
            </Text>

            {modal?.mode === 'add' && (
              <>
                <Text style={styles.label}>หมวดหมู่</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catBtn, formCatId === cat.id && styles.catBtnActive]}
                      onPress={() => setFormCatId(cat.id)}
                    >
                      <Text style={formCatId === cat.id ? styles.catTextActive : styles.catText}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.label}>ชื่อเมนู</Text>
                <TextInput
                  style={styles.input}
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="เช่น ข้าวผัดปู"
                />
              </>
            )}

            <Text style={styles.label}>ราคา (บาท)</Text>
            <TextInput
              style={styles.input}
              value={formPrice}
              onChangeText={setFormPrice}
              keyboardType="decimal-pad"
              placeholder="เช่น 60 หรือ 59.50"
            />

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => setModal(null)}>
                <Text style={styles.btnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.confirmBtn]} onPress={handleSave}>
                <Text style={styles.btnText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#334155',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  name: { fontSize: 16, fontWeight: '600' },
  nameOff: { color: '#94a3b8', textDecorationLine: 'line-through' },
  price: { fontSize: 13, color: '#64748b', marginTop: 2 },
  switchLabel: { fontSize: 11, color: '#64748b' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  popup: { width: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  popupTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 8,
  },
  catBtnActive: { backgroundColor: '#16a34a' },
  catText: { color: '#334155' },
  catTextActive: { color: '#fff', fontWeight: 'bold' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, marginLeft: 8 },
  cancelBtn: { backgroundColor: '#94a3b8' },
  confirmBtn: { backgroundColor: '#16a34a' },
  btnText: { color: '#fff', fontWeight: 'bold' },
});
