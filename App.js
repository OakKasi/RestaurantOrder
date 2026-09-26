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
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SQLiteProvider>
  );
}