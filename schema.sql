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
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','cooking','served')),
  FOREIGN KEY (round_id) REFERENCES order_rounds(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS cancel_items (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  round_id       INTEGER NOT NULL,
  menu_item_id   INTEGER NOT NULL,
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  note           TEXT,
  price_at_order INTEGER NOT NULL CHECK (price_at_order >= 0),
  cancel_at      TEXT NOT NULL,
  FOREIGN KEY (round_id) REFERENCES order_rounds(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_order_items_round_id ON order_items(round_id);
CREATE INDEX IF NOT EXISTS idx_bills_table_status   ON bills(table_id, status);

INSERT OR IGNORE INTO tables (table_number) VALUES
  (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15);

INSERT OR IGNORE INTO categories (id, name) VALUES
  (1, 'อาหารจานเดียว'),
  (2, 'ต้ม/แกง'),
  (3, 'ผัด/ทอด'),
  (4, 'อาหารทะเล'),
  (5, 'เครื่องดื่ม');

INSERT INTO menu_items (category_id, name, price, image_url, is_available)
SELECT column1, column2, column3, '', 1
FROM (VALUES
  (1, 'ข้าวผัดกะเพราหมูสับ', 5000),
  (1, 'ข้าวผัดหมู', 5500),
  (1, 'ข้าวผัดพริกแกงไก่', 5500),
  (1, 'ผัดซีอิ๊วหมู', 4500),
  (1, 'ข้าวหน้าหมูทอด', 6000),
  (1, 'ราดหน้าไก่', 4000),
  (1, 'แกงฟักทองไก่', 6000),
  (2, 'ต้มยำกุ้งน้ำข้น', 15000),
  (2, 'ต้มข่าไก่', 12000),
  (2, 'แกงจืดเต้าหู้หมูสับ', 10000),
  (2, 'แกงเขียวหวานไก่', 12000),
  (2, 'แกงเผ็ดเป็ดย่าง', 18000),
  (2, 'แกงส้มชะอมไข่', 13000),
  (2, 'ต้มแซ่บกระดูกอ่อน', 13000),
  (3, 'ปีกไก่ทอดน้ำปลา', 10000),
  (3, 'หมูกรอบผัดพริกเกลือ', 12000),
  (3, 'ผักบุ้งไฟแดง', 7000),
  (3, 'ทอดมันกุ้ง', 12000),
  (3, 'กะหล่ำปลีผัดน้ำปลา', 8000),
  (3, 'คั่วกลิ้งซี่โครงหมู', 12000),
  (3, 'ผัดพริกแกงไก่', 10000),
  (4, 'ปูผัดผงกะหรี่', 18000),
  (4, 'ปลากะพงนึ่งมะนาว', 25000),
  (4, 'หมึกผัดไข่เค็ม', 15000),
  (4, 'หอยเชลล์อบเนยกระเทียม', 18000),
  (4, 'หอยนางรมทรงเครื่อง', 15000),
  (4, 'กุ้งแม่น้ำเผา', 35000),
  (4, 'กุ้งอบวุ้นเส้น', 15000),
  (5, 'น้ำเปล่า', 1000),
  (5, 'โค้ก', 2000),
  (5, 'ชาไทย', 3500),
  (5, 'กาแฟโบราณ', 3000),
  (5, 'ชาเขียวมะลิ', 3000),
  (5, 'น้ำส้มคั้น', 3500),
  (5, 'น้ำเก๊กฮวย', 2500)
)
WHERE NOT EXISTS (SELECT 1 FROM menu_items);