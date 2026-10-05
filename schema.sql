-- schema.sql

PRAGMA foreign_keys = ON;

-- 1. ตารางหมวดหมู่อาหาร
CREATE TABLE IF NOT EXISTS categories (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- 2. ตารางรายการอาหาร
CREATE TABLE IF NOT EXISTS menu_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id  INTEGER NOT NULL,
  name         TEXT NOT NULL,
  price        INTEGER NOT NULL CHECK (price >= 0),
  image_url    TEXT,
  is_available INTEGER NOT NULL DEFAULT 1 CHECK (is_available IN (0,1)),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- 3. ตารางโต๊ะในร้าน
CREATE TABLE IF NOT EXISTS tables (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  table_number INTEGER NOT NULL UNIQUE
);

-- 4. ตารางบิล
CREATE TABLE IF NOT EXISTS bills (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  table_id  INTEGER NOT NULL,
  opened_at TEXT NOT NULL,
  closed_at TEXT,
  status    TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE RESTRICT
);

-- 5. ตารางรอบการสั่งอาหาร
CREATE TABLE IF NOT EXISTS order_rounds (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_id      INTEGER NOT NULL,
  round_number INTEGER NOT NULL,
  ordered_at   TEXT NOT NULL,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);

-- 6. ตารางรายการอาหารที่สั่งในแต่ละรอบ
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

-- 7. ตารางประวัติการยกเลิกรายการอาหาร (ระดับ ข3)
CREATE TABLE IF NOT EXISTS cancel_items (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  order_item_id  INTEGER NOT NULL,
  cancel_at      TEXT NOT NULL,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_items_round_id ON order_items(round_id);
CREATE INDEX IF NOT EXISTS idx_bills_table_status ON bills(table_id, status);
