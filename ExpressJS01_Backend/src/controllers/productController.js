const {
  getProductsService,
  getProductByIdService,
  getCategoriesService
} = require("../services/productService");

const getProducts = async (req, res) => {
  try {
    const filters = {
      search: req.query.search || "",
      category: req.query.category || "",
      minPrice: req.query.minPrice || "",
      maxPrice: req.query.maxPrice || "",
      type: req.query.type || "", // 'newest', 'bestseller', 'promotion'
      sort: req.query.sort || "" // 'price_asc', 'price_desc'
    };

    const products = await getProductsService(filters);
    if (!products) {
      return res.status(500).json({ EC: -1, EM: "Lỗi lấy danh sách sản phẩm" });
    }

    return res.status(200).json({
      EC: 0,
      EM: "Thành công",
      data: products
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ EC: -1, EM: "Server Error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getProductByIdService(id);

    if (!result) {
      return res.status(404).json({ EC: 1, EM: "Không tìm thấy sản phẩm" });
    }

    return res.status(200).json({
      EC: 0,
      EM: "Thành công",
      data: result
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ EC: -1, EM: "Server Error" });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await getCategoriesService();
    if (!categories) {
      return res.status(500).json({ EC: -1, EM: "Lỗi lấy danh sách danh mục" });
    }

    return res.status(200).json({
      EC: 0,
      EM: "Thành công",
      data: categories
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ EC: -1, EM: "Server Error" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories
};
