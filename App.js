import { StyleSheet, Text, View } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { DATABASE_NAME, initDb}from'./src/db/db';
import Employee from './src/db/screens/employee';

export default function App() {
  return (

        <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDb}>
          <View style = {styles.container}>
             <Employee/>
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
