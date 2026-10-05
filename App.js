import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DATABASE_NAME, initDb } from './src/db/db';
import TablesScreen from './src/screens/TablesScreen';
import MenuScreen from './src/screens/MenuScreen';
import BillSummaryScreen from './src/screens/BillSummaryScreen';
import Order_Screen from './src/screens/order';
import BillHistoryScreen from './src/screens/BillHistoryScreen';
import Add_Menu_Screen from './src/screens/add_menu';
import Dashboard_Screen from './src/screens/dashbord';
import MenuSettingsScreen from './src/screens/MenuSettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDb}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="TablesScreen"
          screenOptions={{
            headerStyle: { backgroundColor: '#ffffff' },
            headerTintColor: '#0284c7',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen
            name="TablesScreen"
            component={TablesScreen}
            options={({ navigation }) => ({
              title: 'ผังโต๊ะอาหาร',
              headerRight: () => (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#0284c7',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 6,
                    }}
                    onPress={() => navigation.navigate('BillHistoryScreen')}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>ประวัติบิล</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#f97316',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                    }}
                    onPress={() => navigation.navigate('OrderScreen')}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>ครัว</Text>
                  </TouchableOpacity>
                </View>
              ),
            })}
          />

          <Stack.Screen
            name="MenuScreen"
            component={MenuScreen}
            options={({ route }) => ({
              title: `สั่งอาหาร โต๊ะ ${route.params?.tableNumber || ''}`
            })}
          />

          <Stack.Screen
            name="BillSummaryScreen"
            component={BillSummaryScreen}
            options={{ title: 'สรุปรายการบิล' }}
          />

          <Stack.Screen
            name="OrderScreen"
            component={Order_Screen}
            options={({ navigation }) => ({
              title: 'หน้าจอครัว (Kitchen)',
              headerRight: () => (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#0284c7',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 6,
                    }}
                    onPress={() => navigation.navigate('Dashboard')}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>ยอดขาย</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#16a34a',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 6,
                    }}
                    onPress={() => navigation.navigate('AddMenuScreen')}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>+ เพิ่มเมนู</Text>
                  </TouchableOpacity>
                </View>
              ),
            })}
          />

          <Stack.Screen
            name="BillHistoryScreen"
            component={BillHistoryScreen}
            options={{ title: 'ประวัติบิลย้อนหลัง' }}
          />

          <Stack.Screen
            name="AddMenuScreen"
            component={Add_Menu_Screen}
            options={{ title: 'เพิ่มเมนูอาหาร' }}
          />

          <Stack.Screen
            name="Dashboard"
            component={Dashboard_Screen}
            options={({ navigation }) => ({
              title: 'เเสดงยอดขาย',
              headerRight: () => (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#16a34a',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 6,
                  }}
                  onPress={() => navigation.navigate('OrderScreen')}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>ครัว</Text>
                </TouchableOpacity>
              ),
            })}
          />

          <Stack.Screen
            name="MenuSettingsScreen"
            component={MenuSettingsScreen}
            options={{ title: 'จัดการและตั้งค่าเมนู' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '700'
  }
});
