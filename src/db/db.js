export const DATABASE_NAME = 'restaurant_db.db'

export async function initDb() {
    await db.execAsync(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            category_id INTEGER NOT NULL,

            FOREIGN KEY (category_id) REFERENCES categories(id)

        );
        CREATE TABLE IF NOT EXISTS tables (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_number TEXT NOT NULL UNIQUE,
        );
        CREATE TABLE IF NOT EXISTS bills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time_opened TEXT NOT NULL,
            time_closed TEXT,
            status TEXT NOT NULL,
            table_id INTEGER NOT NULL DEFAULT 'OPEN',
            
            FOREIGN KEY (table_id) REFERENCES tables(id)
        );
        CREATE TABLE IF NOT EXISTS order_rounds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            round_number INTEGER NOT NULL,
            ordered_at TEXT NOT NULL,
            bill_id INTEGER NOT NULL,

            FOREIGN KEY (bill_id) REFERENCES bills(id)
        );
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quantity INTEGER NOT NULL,
            note TEXT,
            status TEXT NOT NULL,
            rounds_id INTEGER NOT NULL,
            menu_item_id INTEGER NOT NULL,
            
            FOREIGN KEY (rounds_id) REFERENCES order_rounds(id)
            FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
        )
    `)
}