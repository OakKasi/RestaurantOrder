import { StyleSheet, Text, View } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import Order_Screen from './src/screens/order';
import { DATABASE_NAME,initDb } from './src/db/db';
import Add_Menu_Screen from './src/screens/add_menu';
export default function App() {
  return (

        <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDb}>
          <View style = {styles.container}>
             <Add_Menu_Screen/>
          </View>
        </SQLiteProvider>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop:50,
    paddingHorizontal:20
  },
  title:{
    fontSize:24,
    fontWeight:'700'
  }
});
