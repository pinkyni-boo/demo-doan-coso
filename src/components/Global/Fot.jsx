import React from "react";
import { Link } from "react-router-dom";
import { Crown, MapPin, Phone, Clock, Mail, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer-vintage">
      <div className="footer-content">
        {/* Vintage Pattern Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="vintage-pattern w-full h-full"></div>
        </div>

        {/* Decorative Elements - Tối ưu cho mobile */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-vintage-gold opacity-10 rounded-full blur-2xl hidden md:block"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-vintage-primary opacity-15 rounded-full blur-2xl hidden md:block"></div>

        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* About Royal Fitness */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-luxury rounded-lg flex items-center justify-center shadow-golden flex-shrink-0">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <span className="text-xl font-bold vintage-heading text-vintage-gold block">
                    Royal Fitness
                  </span>
                  <p className="vintage-sans text-xs tracking-wider text-vintage-cream opacity-70">
                    LUXURY GYM CLUB
                  </p>
                </div>
              </div>

              <p className="text-vintage-cream text-sm leading-relaxed vintage-serif opacity-90">
                Royal Fitness là hệ thống phòng tập cao cấp mang đến trải nghiệm
                fitness đẳng cấp hoàng gia.
              </p>

              {/* Social Media */}
              <div className="flex space-x-3">
                <SocialLink href="https://facebook.com" bg="hover:bg-blue-600">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </SocialLink>
                <SocialLink href="https://instagram.com" bg="hover:bg-pink-600">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 715.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                </SocialLink>
                <SocialLink href="https://youtube.com" bg="hover:bg-red-600">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </SocialLink>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold vintage-heading text-vintage-gold flex items-center">
                <span className="w-6 h-[2px] bg-vintage-gold mr-3 flex-shrink-0"></span>
                Liên kết
              </h3>
              <ul className="space-y-3">
                <FooterLink to="/club">CLB của chúng tôi</FooterLink>
                <FooterLink to="/services">Dịch vụ cao cấp</FooterLink>
                <FooterLink to="/membership">Gói thành viên</FooterLink>
                <FooterLink to="/classes">Lớp học</FooterLink>
                <FooterLink to="/about">Về chúng tôi</FooterLink>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold vintage-heading text-vintage-gold flex items-center">
                <span className="w-6 h-[2px] bg-vintage-gold mr-3 flex-shrink-0"></span>
                Liên hệ
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-vintage-gold mr-3 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-vintage-cream mb-1 vintage-sans text-sm">
                      Royal Club - CN1
                    </p>
                    <p className="text-vintage-cream opacity-80 text-xs leading-relaxed">
                      Lầu 3, 360 Hai Bà Trưng, Q.1, TP.HCM
                    </p>
                    <p className="text-vintage-gold font-medium mt-1 vintage-sans flex items-center text-xs">
                      <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                      0988 696 360
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-vintage-gold mr-3 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-vintage-cream mb-1 vintage-sans text-sm">
                      Elite Club - CN2
                    </p>
                    <p className="text-vintage-cream opacity-80 text-xs leading-relaxed">
                      23 Dương Quang Đông, Q.8, TP.HCM
                    </p>
                    <p className="text-vintage-gold font-medium mt-1 vintage-sans flex items-center text-xs">
                      <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                      0969 667 823
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours & Newsletter */}
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4 vintage-sans text-vintage-gold flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                  Giờ hoạt động
                </h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex justify-between">
                    <span className="text-vintage-cream opacity-80">
                      T2 - T6
                    </span>
                    <span className="text-vintage-cream font-medium">
                      5:00 - 22:00
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-vintage-cream opacity-80">T7</span>
                    <span className="text-vintage-cream font-medium">
                      6:00 - 21:00
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-vintage-cream opacity-80">CN</span>
                    <span className="text-vintage-cream font-medium">
                      7:00 - 20:00
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 vintage-sans text-vintage-gold flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  Nhận tin tức
                </h4>
                <form className="flex">
                  <input
                    type="email"
                    placeholder="Email"
                    className="px-3 py-2 rounded-l-md text-xs text-vintage-dark flex-1 bg-vintage-cream border-0 focus:ring-2 focus:ring-vintage-gold focus:outline-none vintage-sans"
                  />
                  <button
                    type="submit"
                    className="bg-vintage-gold hover:bg-vintage-gold/80 text-vintage-dark text-xs font-semibold px-4 py-2 rounded-r-md transition-all duration-300 vintage-sans flex-shrink-0"
                  >
                    Gửi
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Decorative Divider */}
          <div className="mb-6">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-vintage-gold to-transparent opacity-70"></div>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-3 md:mb-0">
              <p className="text-vintage-cream opacity-70 vintage-sans text-xs text-center md:text-left">
                © {new Date().getFullYear()} Royal Fitness Club. Tất cả quyền
                được bảo lưu.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                to="/privacy"
                className="text-vintage-cream opacity-70 hover:opacity-100 hover:text-vintage-gold transition-all duration-300 vintage-sans text-xs"
              >
                Chính sách
              </Link>
              <Link
                to="/terms"
                className="text-vintage-cream opacity-70 hover:opacity-100 hover:text-vintage-gold transition-all duration-300 vintage-sans text-xs"
              >
                Điều khoản
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, children, bg }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-10 h-10 rounded-full flex items-center justify-center bg-vintage-primary/30 backdrop-blur-sm border border-vintage-gold/30 text-vintage-cream hover:text-white ${bg} transition-all duration-300 hover:scale-105 hover:shadow-golden flex-shrink-0`}
    >
      {children}
    </a>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="text-vintage-cream opacity-80 hover:opacity-100 hover:text-vintage-gold transition-all duration-300 flex items-center group vintage-sans text-sm"
      >
        <ArrowRight className="w-0 h-3 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300 text-vintage-gold flex-shrink-0" />
        <span>{children}</span>
      </Link>
    </li>
  );
}
