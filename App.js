// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DATABASE_NAME, initDb } from './src/db/db';

import TablesScreen from './src/screens/TablesScreen';
import MenuScreen from './src/screens/MenuScreen';
import BillSummaryScreen from './src/screens/BillSummaryScreen';
import KitchenScreen from './src/screens/KitchenScreen';
import BillHistoryScreen from './src/screens/BillHistoryScreen';
import SalesSummaryScreen from './src/screens/SalesSummaryScreen';
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
            options={{ title: 'ผังโต๊ะอาหาร' }} 
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
            name="KitchenScreen"
            component={KitchenScreen}
            options={{ title: 'หน้าจอครัว' }}
          />
          <Stack.Screen 
            name="BillHistoryScreen" 
            component={BillHistoryScreen} 
            options={{ title: 'ประวัติบิล' }} 
            />
          <Stack.Screen
            name="SalesSummaryScreen"
            component={SalesSummaryScreen}
            options={{ title: 'สรุปยอดขายรายวัน' }}
          />
          <Stack.Screen
            name="MenuSettingsScreen"
            component={MenuSettingsScreen}
            options={{ title: 'ตั้งค่าเมนู' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SQLiteProvider>
  );
}