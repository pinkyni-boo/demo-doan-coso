import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Settings, Crown, Shield } from "lucide-react";

export default function NavBar({ user, setUser }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Kiểm tra đường dẫn hiện tại để highlight menu item active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Xử lý scroll để thay đổi style của navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset avatar error khi user thay đổi
  useEffect(() => {
    setAvatarError(false);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setUserMenuOpen(false);
    navigate("/");
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  // Function để render avatar với better error handling
  const renderAvatar = (size = "w-10 h-10") => {
    // Debug avatar URL
    const avatarUrl = user?.avatar?.url || user?.avatar;
    console.log("Avatar URL:", avatarUrl); // Debug line - có thể xóa sau

    if (avatarUrl && !avatarError) {
      return (
        <img
          src={avatarUrl}
          alt={user.username || "User"}
          className={`${size} rounded-full object-cover border-2 border-white/30 shadow-lg`}
          onError={(e) => {
            console.log("Avatar load error:", e); // Debug line
            handleAvatarError();
          }}
          onLoad={() => {
            console.log("Avatar loaded successfully"); // Debug line
            setAvatarError(false);
          }}
          style={{
            aspectRatio: "1/1", // Đảm bảo tỷ lệ 1:1
            minWidth: size.includes("w-10")
              ? "40px"
              : size.includes("w-12")
              ? "48px"
              : "40px",
            minHeight: size.includes("h-10")
              ? "40px"
              : size.includes("h-12")
              ? "48px"
              : "40px",
          }}
        />
      );
    }

    // Fallback - tạo avatar với chữ cái đầu
    const initials = user?.fullName
      ? user.fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : user?.username?.charAt(0).toUpperCase() || "U";

    return (
      <div
        className={`${size} bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg`}
        style={{
          aspectRatio: "1/1",
          minWidth: size.includes("w-10")
            ? "40px"
            : size.includes("w-12")
            ? "48px"
            : "40px",
          minHeight: size.includes("h-10")
            ? "40px"
            : size.includes("h-12")
            ? "48px"
            : "40px",
        }}
      >
        <span className="text-white font-bold text-sm">{initials}</span>
      </div>
    );
  };

  // Menu cho người chưa đăng nhập (chỉ Home, CLB, Dịch vụ)
  const publicNavLinks = [
    { name: "CLB", path: "/club" },
    { name: "Dịch vụ", path: "/services" },
  ];

  // Menu đầy đủ cho người đã đăng nhập
  const authenticatedNavLinks = [
    { name: "CLB", path: "/club" },
    { name: "Dịch vụ", path: "/services" },
    { name: "Lớp học", path: "/classes" },
    { name: "Lịch của tôi", path: "/my-classes" },
    { name: "Thẻ thành viên", path: "/membership" },
    { name: "Thanh toán", path: "/payment" },
  ];

  // Chọn menu dựa trên trạng thái đăng nhập
  const navLinks = user ? authenticatedNavLinks : publicNavLinks;

  return (
    <header
      className={`navbar-fixed transition-all duration-500 ${
        isScrolled ? "navbar-scrolled py-3" : "navbar-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div
              className={`w-12 h-12 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 ${
                isScrolled ? "shadow-lg" : "shadow-xl"
              }`}
            >
              <Crown className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span
                className={`vintage-heading text-2xl font-bold transition-colors duration-300 whitespace-nowrap ${
                  isScrolled ? "text-stone-800" : "text-white"
                }`}
              >
                Royal Fitness
              </span>
              <span
                className={`vintage-sans text-xs font-medium tracking-wider whitespace-nowrap ${
                  isScrolled ? "text-stone-600" : "text-amber-100"
                }`}
              >
                LUXURY GYM CLUB
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 mx-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`vintage-sans px-2 xl:px-4 py-2 rounded-lg font-medium transition-all duration-300 relative group whitespace-nowrap text-sm xl:text-base ${
                  isActive(link.path)
                    ? isScrolled
                      ? "text-amber-700 bg-amber-50"
                      : "text-amber-100 bg-white/15 shadow-lg"
                    : isScrolled
                    ? "text-stone-600 hover:text-amber-700 hover:bg-amber-50"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.name}
                <span
                  className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-3/4 ${
                    isActive(link.path) ? "w-3/4" : ""
                  }`}
                ></span>
              </Link>
            ))}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Menu với Avatar */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-300 group hover:scale-105 ${
                      isScrolled
                        ? "bg-white border border-amber-200 hover:border-amber-300 shadow-lg"
                        : "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      {renderAvatar()}
                      {/* Online indicator */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>

                    {/* User Info */}
                    <div className="hidden lg:block text-left min-w-[150px] max-w-[200px]">
                      <div
                        className={`vintage-sans font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis ${
                          isScrolled ? "text-stone-800" : "text-white"
                        }`}
                      >
                        {user.fullName || user.username}
                      </div>
                      <div
                        className={`vintage-sans text-xs flex items-center whitespace-nowrap overflow-hidden ${
                          isScrolled ? "text-stone-600" : "text-amber-100"
                        }`}
                      >
                        {user.membership?.type ? (
                          <>
                            <Crown className="h-3 w-3 mr-1 text-amber-500 flex-shrink-0" />
                            <span className="truncate">
                              {user.membership.type} Member
                            </span>
                          </>
                        ) : (
                          <>
                            <Shield className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {user.role === "admin"
                                ? "Quản trị viên"
                                : "Thành viên"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Dropdown Arrow */}
                    <svg
                      className={`w-4 h-4 transform transition-transform duration-200 flex-shrink-0 ${
                        userMenuOpen ? "rotate-180" : ""
                      } ${isScrolled ? "text-stone-600" : "text-amber-100"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu với Enhanced Styling */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-amber-200/50 z-50 overflow-hidden backdrop-blur-sm">
                      {/* Header với Avatar lớn */}
                      <div className="bg-gradient-to-r from-amber-600 to-yellow-600 p-4">
                        <div className="flex items-center space-x-3">
                          {renderAvatar("w-12 h-12")}
                          <div>
                            <div className="text-white font-semibold">
                              {user.fullName || user.username}
                            </div>
                            <div className="text-amber-100 text-sm">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/user"
                          className="flex items-center px-4 py-3 vintage-sans text-stone-800 hover:bg-amber-50 transition-colors duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-3 text-amber-600" />
                          Thông tin cá nhân
                        </Link>

                        {user.role === "admin" && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center px-4 py-3 vintage-sans text-stone-800 hover:bg-amber-50 transition-colors duration-200"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4 mr-3 text-amber-600" />
                            Dashboard
                          </Link>
                        )}

                        <div className="border-t border-amber-200/50 my-2"></div>

                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 vintage-sans text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <button
                    className={`px-6 py-2 rounded-lg vintage-sans font-medium transition-all duration-300 ${
                      isScrolled
                        ? "bg-white border border-amber-300 text-amber-700 hover:bg-amber-50"
                        : "border border-white text-white hover:bg-white hover:text-amber-700"
                    }`}
                  >
                    Đăng nhập
                  </button>
                </Link>
                <Link to="/sign-up">
                  <button className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-yellow-600 hover:to-amber-600 text-white px-6 py-2 rounded-lg vintage-sans font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                    Đăng ký
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors duration-200 ${
                isScrolled
                  ? "text-stone-600 hover:text-stone-800 hover:bg-amber-50"
                  : "text-amber-100 hover:text-white hover:bg-white/10"
              }`}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-menu lg:hidden bg-white shadow-2xl border-t border-amber-200/50">
          <div className="px-4 py-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-4 py-3 rounded-lg vintage-sans font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? "bg-amber-50 text-amber-700"
                    : "text-stone-800 hover:bg-amber-50 hover:text-amber-700"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile User Menu */}
            {user ? (
              <div className="pt-4 border-t border-amber-200/50 space-y-2">
                <div className="flex items-center px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
                  {renderAvatar("w-12 h-12")}
                  <div className="ml-3">
                    <div className="vintage-sans font-semibold text-stone-800">
                      {user.fullName || user.username}
                    </div>
                    <div className="vintage-sans text-sm text-stone-600 ">
                      {user.membership?.type
                        ? `${user.membership.type} Member`
                        : user.role === "admin"
                        ? "Quản trị viên"
                        : "Thành viên"}
                    </div>
                  </div>
                </div>

                <Link
                  to="/user"
                  className="block px-4 py-3 vintage-sans text-stone-800 hover:bg-amber-50 transition-colors duration-200 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Thông tin cá nhân
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="block px-4 py-3 vintage-sans text-stone-800 hover:bg-amber-50 transition-colors duration-200 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 vintage-sans text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-lg"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-amber-200/50 space-y-3">
                <Link
                  to="/login"
                  className="block w-full text-center py-3 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg vintage-sans font-medium transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/sign-up"
                  className="block w-full text-center py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg vintage-sans font-medium shadow-lg transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
