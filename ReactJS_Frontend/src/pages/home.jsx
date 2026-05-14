import React, { useEffect, useState } from "react";
import axios from "../util/axios.customize";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Sparkles, Tag } from "lucide-react";

const ProductCard = ({ product }) => {
  const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
  const image = images && images.length > 0 ? images[0] : "https://via.placeholder.com/300x300";
  const hasDiscount = product.originalPrice > product.price;

  return (
    <div className="group relative rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-lg hover:ring-indigo-500">
      <Link to={`/products/${product.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">Xem chi tiết {product.name}</span>
      </Link>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        {hasDiscount && (
          <div className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </div>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-xs font-medium text-gray-500">{product.categoryName}</p>
        <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-lg font-bold text-indigo-600">${product.price}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon: Icon, products, viewAllLink }) => {
  if (!products || products.length === 0) return null;
  
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          <Link
            to={viewAllLink}
            className="group flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

const HomePage = () => {
  const [newest, setNewest] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [newRes, bestRes, promoRes] = await Promise.all([
          axios.get('/v1/api/products?type=newest'),
          axios.get('/v1/api/products?type=bestseller'),
          axios.get('/v1/api/products?type=promotion')
        ]);
        
        if (newRes?.data) setNewest(newRes.data.slice(0, 4));
        if (bestRes?.data) setBestSellers(bestRes.data.slice(0, 4));
        if (promoRes?.data) setPromotions(promoRes.data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-indigo-900 py-24 sm:py-32">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000"
            alt="Sneakers background"
            className="h-full w-full object-cover object-center opacity-20"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Bứt Phá Giới Hạn Cùng <span className="text-indigo-400">SneakerX</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-indigo-100">
            Khám phá bộ sưu tập giày thể thao mới nhất. Thiết kế đẳng cấp, hiệu năng vượt trội cho mọi hoạt động của bạn.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/search"
              className="rounded-full bg-indigo-500 px-8 py-3 text-base font-bold text-white shadow-sm transition-all hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Mua sắm ngay
            </Link>
          </div>
        </div>
      </div>

      {/* Sections */}
      <Section title="Khuyến mãi sốc" icon={Tag} products={promotions} viewAllLink="/search?type=promotion" />
      <Section title="Sản phẩm mới" icon={Sparkles} products={newest} viewAllLink="/search?type=newest" />
      <Section title="Bán chạy nhất" icon={Flame} products={bestSellers} viewAllLink="/search?type=bestseller" />
    </div>
  );
};

export default HomePage;
