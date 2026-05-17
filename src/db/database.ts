import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";

const sqlite = new SQLiteConnection(CapacitorSQLite);

let db: SQLiteDBConnection;

export const initDatabase = async () => {
  db = await sqlite.createConnection(
    "productsDB",
    false,
    "no-encryption",
    1,
    false
  );

  await db.open();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT,
      category TEXT,
      calories INTEGER,
      image TEXT,
      favorite INTEGER
    );
  `);

  const result = await db.query("SELECT COUNT(*) as count FROM products");

  const count = result.values?.[0]?.count;

  if (count === 0) {
    await seedProducts();
  }

  return db;
};

const seedProducts = async () => {
  const products = [
    [
      1,
      "Green Fresh Peas",
      "food/vegetables",
      134,
      "/products/peas.png",
      0,
    ],
    [
      2,
      "Egg",
      "food/eggs and dairy",
      72,
      "/products/egg.png",
      1,
    ],
    [
      3,
      "Arugula",
      "food/vegetables",
      5,
      "/products/arugula.png",
      0,
    ],
    [
      4,
      "Bok-choy",
      "food/vegetables",
      15,
      "/products/bok-choy.png",
      0,
    ],
    [
      5,
      "Apple",
      "food/fruits",
      20,
      "/products/apple.png",
      1,
    ],
  ];

  for (const product of products) {
    await db.run(
      `
      INSERT INTO products
      (id, name, category, calories, image, favorite)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      product
    );
  }
};

export const getProducts = async () => {
  const result = await db.query("SELECT * FROM products");

  return result.values || [];
};