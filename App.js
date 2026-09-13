import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { DATABASE_NAME, initDb } from './src/db/database';
import { colors } from './src/styles/theme';
import RegisterScreen from './src/screens/RegisterScreen';
import { styles } from './src/styles/appStyles';
export default function App() {
  return (
    <>
    <StatusBar barStyle ='light-content' backgroundColor={colors.bg}/>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDb}>
          <View style = {styles.container}>
            <View style = {styles.header}>
              <Text style={styles.title}>ระบบลงทะเบียนนิสิต</Text>
            </View>
            <RegisterScreen/>
          </View>
    
        </SQLiteProvider>
    
    </>

  );
}
