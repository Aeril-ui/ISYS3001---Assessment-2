CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sell_price REAL NOT NULL CHECK (sell_price >= 0),
  sell_method TEXT NOT NULL CHECK (sell_method IN ('unit', 'kilogram')),
  is_withdrawn INTEGER NOT NULL DEFAULT 0 CHECK (is_withdrawn IN (0, 1))
);

CREATE TABLE IF NOT EXISTS rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed', 'packed'))
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL REFERENCES members (id),
  round_id INTEGER NOT NULL REFERENCES rounds (id),
  is_cancelled INTEGER NOT NULL DEFAULT 0 CHECK (is_cancelled IN (0, 1)),
  UNIQUE (member_id, round_id)
);

CREATE TABLE IF NOT EXISTS order_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products (id),
  quantity REAL NOT NULL CHECK (quantity > 0),
  unit_price REAL NOT NULL CHECK (unit_price >= 0),
  UNIQUE (order_id, product_id)
);
