export const DATABASE_NAME = 'restaurant.db';

export async function initDb(db) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id  INTEGER NOT NULL,
      name         TEXT NOT NULL,
      price        INTEGER NOT NULL CHECK (price >= 0),
      is_available INTEGER NOT NULL DEFAULT 1 CHECK (is_available IN (0,1)),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS tables (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number INTEGER NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS bills (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id  INTEGER NOT NULL,
      opened_at TEXT NOT NULL,
      closed_at TEXT,
      status    TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
      FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS order_rounds (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id      INTEGER NOT NULL,
      round_number INTEGER NOT NULL,
      ordered_at   TEXT NOT NULL,
      FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      round_id       INTEGER NOT NULL,
      menu_item_id   INTEGER NOT NULL,
      quantity       INTEGER NOT NULL CHECK (quantity > 0),
      note           TEXT,
      price_at_order INTEGER NOT NULL CHECK (price_at_order >= 0),
      status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','cooking','served')),
      FOREIGN KEY (round_id) REFERENCES order_rounds(id) ON DELETE CASCADE,
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_round_id ON order_items(round_id);
    CREATE INDEX IF NOT EXISTS idx_bills_table_status ON bills(table_id, status);
  `);

  await seedInitialData(db);
}

export async function seedInitialData(db) {
  const tableCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM tables');
  if (tableCount.count === 0) {
    for (let i = 1; i <= 15; i++) {
      await db.runAsync('INSERT INTO tables (table_number) VALUES (?)', [i]);
    }
  }

  const catCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM categories');
  if (catCount.count === 0) {
    const categories = ['อาหารจานเดียว', 'ต้ม/แกง', 'ผัด/ทอด', 'อาหารทะเล', 'เครื่องดื่ม'];
    for (const cat of categories) {
      await db.runAsync('INSERT INTO categories (name) VALUES (?)', [cat]);
    }

    const menuItems = [
      // อาหารจานเดียว
      { catId: 1, name: 'ข้าวผัดกะเพราหมูสับ', price: 5000 },
      { catId: 1, name: 'ข้าวผัดหมู', price: 5500 },
      { catId: 1, name: 'ข้าวผัดพริกแกงไก่', price: 5500 },
      { catId: 1, name: 'ผัดซีอิ๊วหมู', price: 4500 },
      { catId: 1, name: 'ข้าวหน้าหมูทอด', price: 6000 },
      { catId: 1, name: 'ราดหน้าไก่', price: 4000 },
      { catId: 1, name: 'แกงฟักทองไก่', price: 6000 },

      // ต้ม/แกง
      { catId: 2, name: 'ต้มยำกุ้งน้ำข้น', price: 15000 },
      { catId: 2, name: 'ต้มข่าไก่', price: 12000 },
      { catId: 2, name: 'แกงจืดเต้าหู้หมูสับ', price: 10000 },
      { catId: 2, name: 'แกงเขียวหวานไก่', price: 12000 },
      { catId: 2, name: 'แกงเผ็ดเป็ดย่าง', price: 18000 },
      { catId: 2, name: 'แกงส้มชะอมไข่', price: 13000 },
      { catId: 2, name: 'ต้มแซ่บกระดูกอ่อน', price: 13000 },

      // ผัด/ทอด
      { catId: 3, name: 'ปีกไก่ทอดน้ำปลา', price: 10000 },
      { catId: 3, name: 'หมูกรอบผัดพริกเกลือ', price: 12000 },
      { catId: 3, name: 'ผักบุ้งไฟแดง', price: 7000 },
      { catId: 3, name: 'ทอดมันกุ้ง', price: 12000 },
      { catId: 3, name: 'กะหล่ำปลีผัดน้ำปลา', price: 8000 },
      { catId: 3, name: 'คั่วกลิ้งซี่โครงหมู', price: 12000 },
      { catId: 3, name: 'ผัดพริกแกงไก่', price: 10000 },

      // อาหารทะเล
      { catId: 4, name: 'ปูผัดผงกะหรี่', price: 18000 },
      { catId: 4, name: 'ปลากะพงนึ่งมะนาว', price: 250000 },
      { catId: 4, name: 'หมึกผัดไข่เค็ม', price: 15000 },
      { catId: 4, name: 'หอยเชลล์อบเนยกระเทียม', price: 18000 },
      { catId: 4, name: 'หอยนางรมทรงเครื่อง', price: 15000 },
      { catId: 4, name: 'กุ้งแม่น้ำเผา', price: 35000 },
      { catId: 4, name: 'กุ้งอบวุ้นเส้น', price: 15000 },

      // เครื่องดื่ม
      { catId: 5, name: 'น้ำเปล่า', price: 1000 },
      { catId: 5, name: 'โค้ก', price: 2000 },
      { catId: 5, name: 'ชาไทย', price: 3500 },
      { catId: 5, name: 'กาแฟโบราณ', price: 3000 },
      { catId: 5, name: 'ชาเขียวมะลิ', price: 3000 },
      { catId: 5, name: 'น้ำส้มคั้น', price: 3500 },
      { catId: 5, name: 'น้ำเก๊กฮวย', price: 2500 }
    ];

    for (const item of menuItems) {
      await db.runAsync(
        'INSERT INTO menu_items (category_id, name, price, is_available) VALUES (?, ?, ?, 1)',
        [item.catId, item.name, item.price]
      );
    }
  }
}

export async function clearAllTransactionData(db) {
  await db.execAsync(`
    DELETE FROM order_items;
    DELETE FROM order_rounds;
    DELETE FROM bills;
  `);
}

export async function getCategories(db) {
  return await db.getAllAsync('SELECT * FROM categories ORDER BY id ASC');
}

export async function getMenuItemsByCategory(db, categoryId) {
  return await db.getAllAsync(
    'SELECT * FROM menu_items WHERE category_id = ? AND is_available = 1',
    [categoryId]
  );
}

export async function getNextRoundNumber(db, billId) {
  const result = await db.getFirstAsync(
    'SELECT COALESCE(MAX(round_number), 0) + 1 AS next_round FROM order_rounds WHERE bill_id = ?',
    [billId]
  );
  return result.next_round;
}

export async function submitOrderTransaction(db, billId, cartItems) {
  await db.withTransactionAsync(async () => {
    const nextRound = await getNextRoundNumber(db, billId);
    const nowStr = new Date().toISOString();

    const roundResult = await db.runAsync(
      'INSERT INTO order_rounds (bill_id, round_number, ordered_at) VALUES (?, ?, ?)',
      [billId, nextRound, nowStr]
    );
    const roundId = roundResult.lastInsertRowId;

    for (const item of cartItems) {
      await db.runAsync(
        `INSERT INTO order_items 
         (round_id, menu_item_id, quantity, note, price_at_order, status) 
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [
          roundId,
          item.menuItemId,
          item.quantity,
          item.note || null,
          item.priceAtOrder,
        ]
      );
    }
  });
}

export async function getBillTotal(db, billId) {
  const result = await db.getFirstAsync(
    `SELECT COALESCE(SUM(oi.quantity * oi.price_at_order), 0) AS total_stang
     FROM order_rounds ord
     JOIN order_items oi ON ord.id = oi.round_id
     WHERE ord.bill_id = ?`,
    [billId]
  );
  return result.total_stang;
}