import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { ShoppingBag, Search, User, LogOut, Menu, X } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setAuth({
      isAuthenticated: false,
      user: { email: "", name: "" },
    });
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-indigo-600">
            <ShoppingBag className="h-8 w-8" />
            <span>SneakerX</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Trang chủ</Link>
            <Link to="/search" className="hover:text-indigo-600 transition-colors">Sản phẩm</Link>
            {auth.isAuthenticated && (
               <Link to="/user" className="hover:text-indigo-600 transition-colors">Thành viên</Link>
            )}
          </nav>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center px-8">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm giày..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </form>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {auth.isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Chào, {auth?.user?.name || auth?.user?.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200"
            >
              <User className="h-4 w-4" />
              Đăng nhập
            </Link>
          )}
        </div>

        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </form>
          <nav className="flex flex-col space-y-2 text-sm font-medium text-gray-700">
            <Link to="/" className="p-2 hover:bg-gray-50 rounded-lg">Trang chủ</Link>
            <Link to="/search" className="p-2 hover:bg-gray-50 rounded-lg">Sản phẩm</Link>
            {auth.isAuthenticated && (
               <Link to="/user" className="p-2 hover:bg-gray-50 rounded-lg">Thành viên</Link>
            )}
          </nav>
          <div className="pt-4 border-t border-gray-200">
            {auth.isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <span className="p-2 text-sm font-medium text-gray-700">
                  {auth?.user?.name || auth?.user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg bg-gray-100 p-2 text-sm font-medium text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-lg bg-indigo-600 p-2 text-sm font-medium text-white justify-center"
              >
                <User className="h-4 w-4" />
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
