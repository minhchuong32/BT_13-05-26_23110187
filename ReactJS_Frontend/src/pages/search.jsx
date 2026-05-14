import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "../util/axios.customize";
import { Filter, SlidersHorizontal, Search as SearchIcon } from "lucide-react";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [type, setType] = useState(searchParams.get("type") || "");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/v1/api/categories");
        if (res && res.data) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error("Fetch categories error:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryStr = searchParams.toString();
        const res = await axios.get(`/v1/api/products?${queryStr}`);
        if (res && res.data) {
          setProducts(res.data);
        }
      } catch (error) {
        console.error("Fetch products error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
    if (type) params.set("type", type);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <div className="mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <Filter className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">Bộ Lọc</h2>
              </div>

              <form onSubmit={handleApplyFilters} className="space-y-6">
                {/* Search */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Tìm kiếm</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Tên sản phẩm..."
                      className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Danh mục</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Tất cả</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Khoảng giá ($)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Từ"
                      className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Đến"
                      className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Sắp xếp</label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Mặc định (Mới nhất)</option>
                    <option value="price_asc">Giá tăng dần</option>
                    <option value="price_desc">Giá giảm dần</option>
                  </select>
                </div>
                
                {/* Type */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Loại</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="promotion">Đang khuyến mãi</option>
                    <option value="bestseller">Bán chạy nhất</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Áp dụng bộ lọc
                </button>
              </form>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Sản phẩm {searchParams.get('search') && `cho "${searchParams.get('search')}"`}
              </h1>
              <p className="text-sm text-gray-500">Hiển thị {products.length} kết quả</p>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => {
                  const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                  const img = images && images.length > 0 ? images[0] : "";
                  const hasDiscount = product.originalPrice > product.price;

                  return (
                    <Link key={product.id} to={`/products/${product.id}`} className="group relative rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-lg hover:ring-indigo-500">
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                        <img src={img} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        {hasDiscount && (
                          <div className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <p className="text-xs font-medium text-gray-500">{product.categoryName}</p>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-bold text-indigo-600">${product.price}</span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white">
                <Filter className="mb-4 h-12 w-12 text-gray-300" />
                <p className="text-lg font-medium text-gray-900">Không tìm thấy sản phẩm nào</p>
                <p className="text-sm text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
