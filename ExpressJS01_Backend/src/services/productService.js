const { getPool } = require("../config/database");

const getProductsService = async (filters) => {
  try {
    const pool = getPool();
    let query = `
      SELECT p.*, c.name as categoryName 
      FROM products p 
      LEFT JOIN categories c ON p.categoryId = c.id 
      WHERE 1=1
    `;
    const queryParams = [];

    if (filters.search) {
      query += ` AND p.name LIKE ?`;
      queryParams.push(`%${filters.search}%`);
    }

    if (filters.category) {
      query += ` AND p.categoryId = ?`;
      queryParams.push(filters.category);
    }

    if (filters.minPrice) {
      query += ` AND p.price >= ?`;
      queryParams.push(filters.minPrice);
    }

    if (filters.maxPrice) {
      query += ` AND p.price <= ?`;
      queryParams.push(filters.maxPrice);
    }

    if (filters.type === "newest") {
      query += ` ORDER BY p.createdAt DESC`;
    } else if (filters.type === "bestseller") {
      query += ` ORDER BY p.sold DESC`;
    } else if (filters.type === "promotion") {
      query += ` AND p.originalPrice > p.price ORDER BY (p.originalPrice - p.price) DESC`;
    } else if (filters.sort === "price_asc") {
      query += ` ORDER BY p.price ASC`;
    } else if (filters.sort === "price_desc") {
      query += ` ORDER BY p.price DESC`;
    } else {
      query += ` ORDER BY p.createdAt DESC`;
    }

    const [rows] = await pool.execute(query, queryParams);
    return rows;
  } catch (error) {
    console.error("getProductsService Error: ", error);
    return null;
  }
};

const getProductByIdService = async (id) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT p.*, c.name as categoryName 
       FROM products p 
       LEFT JOIN categories c ON p.categoryId = c.id 
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    const product = rows[0];

    // Lấy sản phẩm tương tự (cùng danh mục, khác id)
    const [similar] = await pool.execute(
      `SELECT * FROM products WHERE categoryId = ? AND id != ? LIMIT 4`,
      [product.categoryId, id]
    );

    return { product, similar };
  } catch (error) {
    console.error("getProductByIdService Error: ", error);
    return null;
  }
};

const getCategoriesService = async () => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute("SELECT * FROM categories ORDER BY name ASC");
    return rows;
  } catch (error) {
    console.error("getCategoriesService Error: ", error);
    return null;
  }
};

module.exports = {
  getProductsService,
  getProductByIdService,
  getCategoriesService
};
