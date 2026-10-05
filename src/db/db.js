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
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM order_items;
      DELETE FROM order_rounds;
      DELETE FROM bills;
      DELETE FROM sqlite_sequence WHERE name IN ('order_items', 'order_rounds', 'bills');
    `);
  });
}

export async function getTablesWithOpenBill(db) {
  return await db.getAllAsync(
    `SELECT t.id, t.table_number, b.id AS bill_id
     FROM tables t
     LEFT JOIN bills b ON b.table_id = t.id AND b.status = 'open'
     ORDER BY t.table_number`
  );
}

export async function getOrCreateOpenBill(db, tableId) {
  let billId = null;
  await db.withTransactionAsync(async () => {
    const existing = await db.getFirstAsync(
      "SELECT id FROM bills WHERE table_id = ? AND status = 'open' LIMIT 1",
      [tableId]
    );
    if (existing) {
      billId = existing.id;
      return;
    }
    const result = await db.runAsync(
      "INSERT INTO bills (table_id, opened_at, status) VALUES (?, ?, 'open')",
      [tableId, new Date().toISOString()]
    );
    billId = result.lastInsertRowId;
  });
  return billId;
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

export async function getKitchenItems(db, includeServed = false) {
  return await db.getAllAsync(
    `SELECT oi.id, oi.quantity, oi.note, oi.status,
            mi.name AS menu_name,
            ord.round_number, ord.ordered_at,
            t.table_number
     FROM order_items oi
     JOIN order_rounds ord ON oi.round_id = ord.id
     JOIN bills b ON ord.bill_id = b.id
     JOIN tables t ON b.table_id = t.id
     JOIN menu_items mi ON oi.menu_item_id = mi.id
     WHERE b.status = 'open'
       AND (? = 1 OR oi.status != 'served')
     ORDER BY ord.ordered_at ASC, oi.id ASC`,
    [includeServed ? 1 : 0]
  );
}

export async function updateOrderItemStatus(db, itemId, status) {
  await db.runAsync(
    'UPDATE order_items SET status = ? WHERE id = ?',
    [status, itemId]
  );
}

export async function closeBill(db, billId) {
  const result = await db.runAsync(
    "UPDATE bills SET status = 'closed', closed_at = ? WHERE id = ? AND status = 'open'",
    [new Date().toISOString(), billId]
  );
  return result.changes > 0;
}

export async function getBillStatus(db, billId) {
  const row = await db.getFirstAsync('SELECT status FROM bills WHERE id = ?', [billId]);
  return row ? row.status : null;
}

export async function getBillRoundItems(db, billId) {
  return await db.getAllAsync(
    `SELECT ord.id AS round_id, ord.round_number, ord.ordered_at,
            mi.name AS menu_name, oi.quantity, oi.note,
            oi.price_at_order, oi.status,
            SUM(oi.quantity * oi.price_at_order) OVER (PARTITION BY ord.id) AS round_total
     FROM order_rounds ord
     JOIN order_items oi ON oi.round_id = ord.id
     JOIN menu_items mi ON oi.menu_item_id = mi.id
     WHERE ord.bill_id = ?
     ORDER BY ord.round_number, oi.id`,
    [billId]
  );
}

export async function getClosedBills(db) {
  return await db.getAllAsync(
    `SELECT b.id, t.table_number, b.opened_at, b.closed_at,
            COALESCE(SUM(oi.quantity * oi.price_at_order), 0) AS total
     FROM bills b
     JOIN tables t ON b.table_id = t.id
     LEFT JOIN order_rounds ord ON ord.bill_id = b.id
     LEFT JOIN order_items oi ON oi.round_id = ord.id
     WHERE b.status = 'closed'
     GROUP BY b.id, t.table_number, b.opened_at, b.closed_at
     ORDER BY b.closed_at DESC`
  );
}

export async function getDailySalesByCategory(db, startIso, endIso) {
  return await db.getAllAsync(
    `SELECT c.id AS category_id,
            c.name AS category_name,
            SUM(oi.quantity) AS total_qty,
            SUM(oi.quantity * oi.price_at_order) AS total_sales
     FROM bills b
     JOIN order_rounds ord ON ord.bill_id = b.id
     JOIN order_items oi ON oi.round_id = ord.id
     JOIN menu_items mi ON oi.menu_item_id = mi.id
     JOIN categories c ON mi.category_id = c.id
     WHERE b.status = 'closed' AND b.closed_at >= ? AND b.closed_at < ?
     GROUP BY c.id, c.name
     ORDER BY total_sales DESC`,
    [startIso, endIso]
  );
}

export async function getDailySalesTotal(db, startIso, endIso) {
  return await db.getFirstAsync(
    `SELECT COUNT(DISTINCT b.id) AS bill_count,
            COALESCE(SUM(oi.quantity * oi.price_at_order), 0) AS total
     FROM bills b
     JOIN order_rounds ord ON ord.bill_id = b.id
     JOIN order_items oi ON oi.round_id = ord.id
     WHERE b.status = 'closed' AND b.closed_at >= ? AND b.closed_at < ?`,
    [startIso, endIso]
  );
}

export async function getAllMenuItems(db) {
  return await db.getAllAsync(
    `SELECT mi.id, mi.name, mi.price, mi.is_available,
            mi.category_id, c.name AS category_name
     FROM menu_items mi
     JOIN categories c ON mi.category_id = c.id
     ORDER BY c.id ASC, mi.id ASC`
  );
}

export async function addMenuItem(db, categoryId, name, price) {
  await db.runAsync(
    'INSERT INTO menu_items (category_id, name, price, is_available) VALUES (?, ?, ?, 1)',
    [categoryId, name, price]
  );
}

export async function updateMenuItemPrice(db, menuItemId, price) {
  await db.runAsync('UPDATE menu_items SET price = ? WHERE id = ?', [price, menuItemId]);
}

export async function setMenuItemAvailability(db, menuItemId, isAvailable) {
  await db.runAsync('UPDATE menu_items SET is_available = ? WHERE id = ?', [
    isAvailable ? 1 : 0,
    menuItemId,
  ]);
}