import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../util/axios.customize";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ShoppingCart, Plus, Minus, Package, Activity } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/v1/api/products/${id}`);
        if (res && res.data) {
          setData(res.data);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (!data || !data.product) {
    return <div className="text-center py-20 text-xl font-medium text-gray-600">Sản phẩm không tồn tại</div>;
  }

  const { product, similar } = data;
  const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
  const hasDiscount = product.originalPrice > product.price;

  const handleQuantityChange = (type) => {
    if (type === 'inc' && quantity < product.stock) {
      setQuantity(q => q + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex text-sm text-gray-500">
          <Link to="/" className="hover:text-indigo-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link to={`/search?category=${product.categoryId}`} className="hover:text-indigo-600">{product.categoryName}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Images Gallery */}
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
            {images && images.length > 0 ? (
              <Swiper
                navigation={true}
                pagination={{ clickable: true }}
                modules={[Navigation, Pagination]}
                className="aspect-square rounded-xl"
              >
                {images.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                Không có hình ảnh
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{product.name}</h1>
            
            <div className="mt-4 flex items-end gap-4">
              <span className="text-3xl font-bold text-indigo-600">${product.price}</span>
              {hasDiscount && (
                <span className="text-xl text-gray-400 line-through mb-1">${product.originalPrice}</span>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
                <Package className="h-4 w-4" />
                <span>Còn lại: <span className="font-medium text-gray-900">{product.stock}</span></span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
                <Activity className="h-4 w-4" />
                <span>Đã bán: <span className="font-medium text-gray-900">{product.sold}</span></span>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900">Mô tả sản phẩm</h3>
              <div className="mt-4 prose prose-indigo text-gray-500">
                <p>{product.description}</p>
              </div>
            </div>

            <div className="mt-auto border-t border-gray-200 pt-8">
              <div className="flex items-center gap-6">
                <div className="flex items-center rounded-lg border border-gray-300">
                  <button 
                    onClick={() => handleQuantityChange('dec')}
                    className="p-3 text-gray-600 transition-colors hover:text-indigo-600 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange('inc')}
                    className="p-3 text-gray-600 transition-colors hover:text-indigo-600 disabled:opacity-50"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200">
                  <ShoppingCart className="h-5 w-5" />
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similar && similar.length > 0 && (
          <div className="mt-24">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">Sản phẩm tương tự</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map(item => {
                const itemImages = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
                const img = itemImages && itemImages.length > 0 ? itemImages[0] : "";
                return (
                  <Link key={item.id} to={`/products/${item.id}`} className="group relative rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-lg hover:ring-indigo-500">
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                      <img src={img} alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                      <p className="mt-1 font-bold text-indigo-600">${item.price}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
