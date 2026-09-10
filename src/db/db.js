import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('restaurant.db');

export default db;