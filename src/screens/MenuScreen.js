import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getCategories, getMenuItemsByCategory, submitOrderTransaction } from '../db/db';

export default function MenuScreen({ route, navigation }) {
  const { billId, tableNumber } = route.params || {};
  const db = useSQLiteContext();

  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [tempQty, setTempQty] = useState(1);
  const [tempNote, setTempNote] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            backgroundColor: '#0284c7',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
          }}
          onPress={() => navigation.navigate('BillSummaryScreen', { billId, tableNumber })}
        >
          <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 13 }}>สรุปบิล</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, billId, tableNumber]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await getCategories(db);
      setCategories(cats);
      if (cats && cats.length > 0) {
        handleSelectCategory(cats[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSelectCategory = async (catId) => {
    setSelectedCatId(catId);
    try {
      const items = await getMenuItemsByCategory(db, catId);
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const openItemModal = (item) => {
    setSelectedMenuItem(item);
    const existing = cart[item.id];
    if (existing) {
      setTempQty(existing.quantity);
      setTempNote(existing.note || '');
    } else {
      setTempQty(1);
      setTempNote('');
    }
    setModalVisible(true);
  };

  const saveToCart = () => {
    if (tempQty <= 0) {
      const updatedCart = { ...cart };
      delete updatedCart[selectedMenuItem.id];
      setCart(updatedCart);
    } else {
      setCart((prev) => ({
        ...prev,
        [selectedMenuItem.id]: {
          menuItemId: selectedMenuItem.id,
          name: selectedMenuItem.name,
          priceAtOrder: selectedMenuItem.price,
          quantity: tempQty,
          note: tempNote,
        },
      }));
    }
    setModalVisible(false);
  };

  const cartList = Object.values(cart);
  const cartTotalStang = cartList.reduce((sum, item) => sum + item.quantity * item.priceAtOrder, 0);
  const handleOpenReview = () => {
    if (cartList.length === 0) {
      Alert.alert('แจ้งเตือน', 'กรุณาเลือกรายการอาหารก่อนส่งเข้าครัว');
      return;
    }
    setReviewModalVisible(true);
  };

  const handleConfirmOrder = async () => {
    if (cartList.length === 0) {
      Alert.alert('แจ้งเตือน', 'กรุณาเลือกรายการอาหารก่อนส่งเข้าครัว');
      return;
    }

    try {
      await submitOrderTransaction(db, billId, cartList);
      setReviewModalVisible(false);
      Alert.alert('สำเร็จ', 'ส่งรายการเข้าครัวเรียบร้อยแล้ว!');
      setCart({});
    } catch (error) {
      console.error('Submit order error:', error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถส่งออร์เดอร์ได้');
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ height: 50 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catBtn, selectedCatId === cat.id && styles.catBtnActive]}
              onPress={() => handleSelectCategory(cat.id)}
            >
              <Text style={selectedCatId === cat.id ? styles.catTextActive : styles.catText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const inCart = cart[item.id];
          return (
            <TouchableOpacity style={styles.menuCard} onPress={() => openItemModal(item)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuName}>{item.name}</Text>
                <Text style={styles.menuPrice}>{(item.price / 100).toFixed(2)} บาท</Text>
              </View>
              {inCart && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>x{inCart.quantity}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {cartList.length > 0 && (
        <View style={styles.cartFooter}>
          <Text style={styles.cartCountText}>เลือกไว้ {cartList.length} รายการ</Text>
          <TouchableOpacity style={styles.submitBtn} onPress={handleOpenReview}>
            <Text style={styles.submitBtnText}>ตรวจรายการ & ส่งเข้าครัว</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.popupOverlay}>
          <View style={styles.popupBg}>
            <Text style={styles.popupMenu}>{selectedMenuItem?.name}</Text>
            <Text style={styles.popupPrice}>ราคา {((selectedMenuItem?.price || 0) / 100).toFixed(2)} บาท</Text>

            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setTempQty(Math.max(0, tempQty - 1))}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyVal}>{tempQty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setTempQty(tempQty + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>หมายเหตุ</Text>
            <TextInput
              style={styles.inputNote}
              value={tempNote}
              onChangeText={setTempNote}
              placeholder="ระบุข้อความเพิ่มเติม..."
            />

            <View style={styles.popupActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.confirmBtn]}
                onPress={saveToCart}
              >
                <Text style={styles.btnText}>ตกลง</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal ตรวจสอบรายการก่อนยืนยันส่งเข้าครัว (ก4) */}
      <Modal visible={reviewModalVisible} animationType="slide" transparent>
        <View style={styles.popupOverlay}>
          <View style={[styles.popupBg, { maxHeight: '80%' }]}>
            <Text style={[styles.popupMenu, { textAlign: 'center', marginBottom: 4 }]}>
              ตรวจทานรายการ (โต๊ะ {tableNumber})
            </Text>
            <Text style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginBottom: 12 }}>
              กรุณาตรวจสอบรายการก่อนส่งเข้าครัว
            </Text>

            <ScrollView style={{ maxHeight: 280, marginVertical: 8 }}>
              {cartList.map((item) => (
                <View key={item.menuItemId} style={styles.reviewItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewItemName}>{item.name}</Text>
                    {item.note ? (
                      <Text style={styles.reviewItemNote}>หมายเหตุ: {item.note}</Text>
                    ) : null}
                    <Text style={styles.reviewItemUnitPrice}>
                      x{item.quantity} (@ {(item.priceAtOrder / 100).toFixed(2)} บ.)
                    </Text>
                  </View>
                  <Text style={styles.reviewItemPrice}>
                    {((item.quantity * item.priceAtOrder) / 100).toFixed(2)} บ.
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.reviewTotalRow}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>ยอดรวมรอบนี้</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#16a34a' }}>
                {(cartTotalStang / 100).toFixed(2)} บาท
              </Text>
            </View>

            <View style={[styles.popupActions, { marginTop: 14 }]}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => setReviewModalVisible(false)}
              >
                <Text style={styles.btnText}>แก้ไขรายการ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.confirmBtn]}
                onPress={handleConfirmOrder}
              >
                <Text style={styles.btnText}>ยืนยันส่งเข้าครัว</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4'
  },
  catScroll: {
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  catBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 8
  },
  catBtnActive: {
    backgroundColor: '#16a34a'
  },
  catText: {
    color: '#334155'
  },
  catTextActive: {
    color: '#fff',
    fontWeight: 'bold'
  },
  menuCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    alignItems: 'center'
  },
  menuName: {
    fontSize: 16,
    fontWeight: '600'
  },
  menuPrice: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2
  },
  badge: {
    backgroundColor: '#f87c24',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  cartFooter: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cartCountText: {
    fontSize: 15,
    fontWeight: '500'
  },
  submitBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  popupBg: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20
  },
  popupMenu: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  popupPrice: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  qtyBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  qtyVal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20
  },
  label: {
    fontSize: 14,
    marginBottom: 6
  },
  inputNote: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16
  },
  popupActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8
  },
  cancelBtn: {
    backgroundColor: '#94a3b8'
  },
  confirmBtn: {
    backgroundColor: '#16a34a'
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  headerBillBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  headerBillBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },  // 👇 เพิ่มชุด style สำหรับหน้าตรวจรายการ (ก4)
  reviewItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  reviewItemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewItemNote: {
    fontSize: 12,
    color: '#16a34a',
    marginTop: 2,
  },
  reviewItemUnitPrice: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  reviewItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    marginTop: 4,
  },

});