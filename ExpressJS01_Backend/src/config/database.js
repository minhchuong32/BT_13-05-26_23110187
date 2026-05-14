require("dotenv").config();
// const mongoose = require("mongoose");
//
// const dbState = [
//   { value: 0, label: "Disconnected" },
//   { value: 1, label: "Connected" },
//   { value: 2, label: "Connecting" },
//   { value: 3, label: "Disconnecting" },
// ];

const mysql = require("mysql2/promise");

let pool = null;

const connection = async () => {
  // const mongoUri =
  //   process.env.MONGO_URI ||
  //   process.env.MONGO_DB_URL ||
  //   "mongodb://127.0.0.1:27017/expressjs01";
  //
  // await mongoose.connect(mongoUri);
  // const state = Number(mongoose.connection.readyState);
  // console.log(dbState.find((f) => f.value === state).label, "to database");

  const mysqlHost = process.env.MYSQL_HOST || "127.0.0.1";
  const mysqlPort = Number(process.env.MYSQL_PORT || 3306);
  const mysqlUser = process.env.MYSQL_USER || "root";
  const mysqlPassword = process.env.MYSQL_PASSWORD || "2357";
  const mysqlDatabase = process.env.MYSQL_DATABASE || "expressjs01";

  const bootstrapConnection = await mysql.createConnection({
    host: mysqlHost,
    port: mysqlPort,
    user: mysqlUser,
    password: mysqlPassword,
  });

  await bootstrapConnection.query(
    `CREATE DATABASE IF NOT EXISTS \`${mysqlDatabase}\``,
  );
  await bootstrapConnection.end();

  pool = mysql.createPool({
    host: mysqlHost,
    port: mysqlPort,
    user: mysqlUser,
    password: mysqlPassword,
    database: mysqlDatabase,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const connection = await pool.getConnection();
  connection.release();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'User',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      originalPrice DECIMAL(10,2),
      stock INT DEFAULT 0,
      sold INT DEFAULT 0,
      categoryId INT,
      images JSON,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  const [categories] = await pool.query('SELECT COUNT(*) as count FROM categories');
  if (categories[0].count === 0) {
    await pool.query("INSERT INTO categories (name) VALUES ('Sneakers'), ('Running'), ('Casual')");
    
    const [catRows] = await pool.query('SELECT id, name FROM categories');
    const catMap = {};
    catRows.forEach(c => catMap[c.name] = c.id);

    const seedProducts = [
      { name: "Nike Air Max 270", desc: "Giày thể thao êm ái với đệm khí độc quyền.", price: 120, oPrice: 150, stock: 50, sold: 120, cat: catMap['Sneakers'], img: '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800&q=80"]' },
      { name: "Adidas Ultraboost", desc: "Giày chạy bộ chuyên nghiệp, hoàn trả năng lượng tối đa.", price: 180, oPrice: 200, stock: 30, sold: 45, cat: catMap['Running'], img: '["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80"]' },
      { name: "Puma Suede Classic", desc: "Giày casual phong cách đường phố, da lộn cao cấp.", price: 80, oPrice: 80, stock: 100, sold: 20, cat: catMap['Casual'], img: '["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80"]' },
      { name: "Vans Old Skool", desc: "Giày trượt ván cổ điển, thiết kế không bao giờ lỗi thời.", price: 60, oPrice: 65, stock: 200, sold: 500, cat: catMap['Casual'], img: '["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80"]' },
      { name: "New Balance 574", desc: "Thoải mái mọi lúc mọi nơi, thiết kế retro tinh tế.", price: 90, oPrice: 100, stock: 15, sold: 5, cat: catMap['Sneakers'], img: '["https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80"]' }
    ];

    for (let p of seedProducts) {
      await pool.query(
        "INSERT INTO products (name, description, price, originalPrice, stock, sold, categoryId, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [p.name, p.desc, p.price, p.oPrice, p.stock, p.sold, p.cat, p.img]
      );
    }
    console.log("Seeded default categories and products");
  }

  console.log("Connected to MySQL database");
  return pool;
};

const getPool = () => {
  if (!pool) {
    throw new Error(
      "MySQL pool has not been initialized. Call connection() first.",
    );
  }

  return pool;
};

module.exports = connection;
module.exports.getPool = getPool;
