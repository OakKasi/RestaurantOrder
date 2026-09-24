import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { DATABASE_NAME, initDb } from './src/db/db';

import MenuScreen from './src/screens/MenuScreen';

export default function App() {
  
  const mockRoute = {
    params: { billId: 1, tableNumber: 1 }
  };

  const mockNavigation = {
    navigate: (screenName, params) => {
      console.log('Navigate to:', screenName, params);
    }
  };

  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDb}>
      <View style={styles.container}>
        <MenuScreen route={mockRoute} navigation={mockNavigation} />
        <StatusBar style="auto" />
      </View>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
});
