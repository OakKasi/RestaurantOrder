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
      image_url    TEXT,
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
      status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','cooking','served','cancel')),
      FOREIGN KEY (round_id) REFERENCES order_rounds(id) ON DELETE CASCADE,
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS cancel_items (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      order_item_id  INTEGER NOT NULL,
      cancel_at      TEXT NOT NULL,
      FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_round_id ON order_items(round_id);
    CREATE INDEX IF NOT EXISTS idx_bills_table_status ON bills(table_id, status);
  `);

  await seedInitialData(db);
}

// -------------------------------------------------------------
// เมนูอาหาร (Menu Items & Categories)
// -------------------------------------------------------------

export async function Add_MenuItem(db, category_id, name, price, image_url = '') {
  return await db.runAsync(
    `INSERT INTO menu_items (category_id, name, price, image_url, is_available) VALUES (?, ?, ?, ?, 1)`,
    [category_id, name, price, image_url]
  );
}

export async function getAllMenuItems(db) {
  return await db.getAllAsync(`
    SELECT mi.id, mi.name, mi.price, mi.image_url, mi.is_available,
           mi.category_id, c.name AS category_name
    FROM menu_items mi
    JOIN categories c ON mi.category_id = c.id
    ORDER BY c.id ASC, mi.id ASC
  `);
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

export async function getCategories(db) {
  return await db.getAllAsync('SELECT * FROM categories ORDER BY id ASC');
}

export async function getMenuItemsByCategory(db, categoryId) {
  return await db.getAllAsync(
    'SELECT * FROM menu_items WHERE category_id = ? AND is_available = 1',
    [categoryId]
  );
}

// -------------------------------------------------------------
// ออเดอร์และห้องครัว (Orders & Kitchen)
// -------------------------------------------------------------

export async function cancel_item(db, id_item) {
  await db.runAsync(
    `INSERT INTO cancel_items (order_item_id, cancel_at) VALUES (?, ?)`,
    [id_item, new Date().toISOString()]
  );
  await db.runAsync(`UPDATE order_items SET status='cancel' WHERE id=?`, [id_item]);
}

export async function Clear_Order(db, id) {
  await db.runAsync(`DELETE FROM order_items WHERE id=?`, [id]);
}

export async function Clear_All_Order(db) {
  await db.runAsync(`DELETE FROM order_items`);
}

export async function List_order(db) {
  const order = await db.getAllAsync(`
    SELECT 
      order_items.id,
      order_items.quantity,
      order_items.note,
      order_items.status,
      order_rounds.round_number AS round_number,
      menu_items.name AS name,
      tables.table_number AS "table",
      (order_items.price_at_order / 100.0) AS price
    FROM order_items
    JOIN menu_items ON order_items.menu_item_id = menu_items.id
    JOIN order_rounds ON order_items.round_id = order_rounds.id
    JOIN bills ON order_rounds.bill_id = bills.id
    JOIN tables ON bills.table_id = tables.id
    ORDER BY order_items.id ASC
  `);
  return order;
}

export async function Update_Status(db, id, current_status) {
  await db.runAsync(`UPDATE order_items SET status=? WHERE id=?`, [current_status, id]);
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

// -------------------------------------------------------------
// โต๊ะและบิล (Tables & Bills)
// -------------------------------------------------------------

export async function getTablesWithBillStatus(db) {
  return await db.getAllAsync(`
    SELECT
      t.id,
      t.table_number,
      MIN(b.id) AS bill_id,
      MAX(b.status) AS bill_status
    FROM tables t
    LEFT JOIN bills b ON b.table_id = t.id AND b.status = 'open'
    GROUP BY t.id, t.table_number
    ORDER BY t.table_number
  `);
}

export async function getOpenBillForTable(db, tableId) {
  return await db.getFirstAsync(
    "SELECT id FROM bills WHERE table_id = ? AND status = 'open' LIMIT 1",
    [tableId]
  );
}

export async function openNewBill(db, tableId) {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO bills (table_id, opened_at, status) VALUES (?, ?, ?)',
    [tableId, now, 'open']
  );
  return result.lastInsertRowId;
}

export async function getBillRoundsWithItems(db, billId) {
  const roundRows = await db.getAllAsync(
    'SELECT id, round_number, ordered_at FROM order_rounds WHERE bill_id = ? ORDER BY round_number',
    [billId]
  );
  const roundsWithItems = [];
  for (const round of roundRows) {
    const items = await db.getAllAsync(
      `SELECT oi.menu_item_id, mi.name as menu_name, oi.quantity, oi.note, oi.price_at_order, oi.status 
       FROM order_items oi 
       JOIN menu_items mi ON oi.menu_item_id = mi.id 
       WHERE oi.round_id = ?`,
      [round.id]
    );
    roundsWithItems.push({ ...round, items });
  }
  return roundsWithItems;
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

export async function closeBill(db, billId) {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE bills SET status = 'closed', closed_at = ? WHERE id = ?`,
    [now, billId]
  );
}

export async function getClosedBills(db) {
  return await db.getAllAsync(`
    SELECT 
      bills.id,
      bills.opened_at,
      bills.closed_at,
      tables.table_number,
      COALESCE(SUM(order_items.quantity * order_items.price_at_order), 0) AS total_stang
    FROM bills 
    JOIN tables ON bills.table_id = tables.id
    LEFT JOIN order_rounds ON bills.id = order_rounds.bill_id
    LEFT JOIN order_items ON order_rounds.id = order_items.round_id
    WHERE bills.status = 'closed'
    GROUP BY bills.id
    ORDER BY bills.closed_at DESC
  `);
}

// -------------------------------------------------------------
// รายงานยอดขาย (Sales Dashboard)
// -------------------------------------------------------------

export async function selling(db) {
  const row = await db.getAllAsync(`SELECT name FROM categories`);

  let all = 0;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

  const sale = await db.getAllAsync(`
    SELECT categories.name, COALESCE(SUM(order_items.price_at_order * order_items.quantity), 0) AS total_sales 
    FROM bills 
    JOIN order_rounds ON bills.id = order_rounds.bill_id
    JOIN order_items ON order_rounds.id = order_items.round_id
    JOIN menu_items ON order_items.menu_item_id = menu_items.id
    JOIN categories ON menu_items.category_id = categories.id
    WHERE bills.status = 'closed' AND bills.closed_at >= ? AND bills.closed_at <= ? 
    GROUP BY categories.name`,
    [start, end]
  );

  const result = {};
  sale.forEach((row) => {
    result[row.name] = row.total_sales;
    all += row.total_sales;
  });

  const response = row.map((item) => ({
    name: item.name,
    price: result[item.name] / 100 || 0,
  }));

  response.push({
    name: 'ยอดขายรวมทั้งหมด',
    price: all / 100,
  });

  return response;
}

// -------------------------------------------------------------
// ข้อมูลตั้งต้น & ล้างข้อมูล (Seed & Reset)
// -------------------------------------------------------------

export async function seedInitialData(db) {
  // 1. เช็คและสร้างโต๊ะ 15 โต๊ะ
  const tableCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM tables');
  if (tableCount.count === 0) {
    for (let i = 1; i <= 15; i++) {
      await db.runAsync('INSERT INTO tables (table_number) VALUES (?)', [i]);
    }
  }

  // 2. เช็คและสร้างหมวดหมู่
  const catCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM categories');
  if (catCount.count === 0) {
    const categories = ['อาหารจานเดียว', 'ต้ม/แกง', 'ผัด/ทอด', 'อาหารทะเล', 'เครื่องดื่ม'];
    for (const cat of categories) {
      await db.runAsync('INSERT INTO categories (name) VALUES (?)', [cat]);
    }
  }

  // 3. เช็คตาราง menu_items
  const itemCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM menu_items');
  if (itemCount.count === 0) {
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
      { catId: 4, name: 'ปลากะพงนึ่งมะนาว', price: 25000 },
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
      { catId: 5, name: 'น้ำเก๊กฮวย', price: 2500 },
    ];

    for (const item of menuItems) {
      await db.runAsync(
        'INSERT INTO menu_items (category_id, name, price, image_url, is_available) VALUES (?, ?, ?, ?, 1)',
        [item.catId, item.name, item.price, '']
      );
    }
  }
}

export async function clearAllTransactionData(db) {
  await db.execAsync(`
    DELETE FROM cancel_items;
    DELETE FROM order_items;
    DELETE FROM order_rounds;
    DELETE FROM bills;
  `);
}
