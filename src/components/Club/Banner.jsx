import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const VintageBanner = ({
  images = [],
  title = "Royal Fitness Club",
  subtitle = "Nơi khởi nguồn cho hành trình hoàn thiện bản thân",
  showButtons = true,
  children,
  height = "h-screen",
  autoPlay = true,
  autoPlayInterval = 5000,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Default images nếu không truyền từ parent
  const defaultImages = [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  ];

  const bannerImages = images.length > 0 ? images : defaultImages;

  // Auto play functionality
  useEffect(() => {
    if (!autoPlay || bannerImages.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, bannerImages.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? bannerImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className={`relative w-full ${height} overflow-hidden ${className}`}>
      {/* Background Images */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={bannerImages[currentIndex]}
              alt={`Banner ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Vintage Overlay Patterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-vintage-dark/70 via-vintage-dark/30 to-vintage-dark/80 z-10"></div>

      {/* Decorative Corner Ornaments */}
      <div className="absolute top-0 left-0 w-24 h-24 z-20">
        <div className="vintage-ornament-top-left"></div>
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 z-20">
        <div className="vintage-ornament-top-right"></div>
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 z-20">
        <div className="vintage-ornament-bottom-left"></div>
      </div>
      <div className="absolute bottom-0 right-0 w-24 h-24 z-20">
        <div className="vintage-ornament-bottom-right"></div>
      </div>

      {/* Main Content */}
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <div className="text-center text-white px-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="vintage-content-frame p-12 bg-vintage-dark/20 backdrop-blur-sm border border-vintage-gold/30 rounded-3xl"
          >
            {/* Decorative Top Border */}
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-vintage-gold to-transparent mx-auto mb-8"></div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold vintage-heading text-shadow-strong mb-6 text-vintage-cream"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-xl md:text-2xl lg:text-3xl text-vintage-cream vintage-serif text-shadow-soft mb-10 leading-relaxed max-w-4xl mx-auto opacity-90"
            >
              {subtitle}
            </motion.p>

            {/* Decorative Middle Divider */}
            <div className="flex items-center justify-center mb-10">
              <div className="w-16 h-px bg-vintage-gold"></div>
              <div className="w-3 h-3 bg-vintage-gold rotate-45 mx-4"></div>
              <div className="w-16 h-px bg-vintage-gold"></div>
            </div>

            {showButtons && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              >
                {children}
              </motion.div>
            )}

            {/* Decorative Bottom Border */}
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-vintage-gold to-transparent mx-auto mt-8"></div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Controls */}
      {bannerImages.length > 1 && (
        <>
          {/* Arrow Navigation */}
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute top-1/2 left-6 md:left-8 -translate-y-1/2 w-14 h-14 bg-vintage-dark/40 hover:bg-vintage-dark/60 backdrop-blur-sm rounded-full border-2 border-vintage-gold/30 hover:border-vintage-gold/60 transition-all duration-300 z-40 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-vintage-cream group-hover:text-vintage-gold transition-colors mx-auto" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="absolute top-1/2 right-6 md:right-8 -translate-y-1/2 w-14 h-14 bg-vintage-dark/40 hover:bg-vintage-dark/60 backdrop-blur-sm rounded-full border-2 border-vintage-gold/30 hover:border-vintage-gold/60 transition-all duration-300 z-40 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-vintage-cream group-hover:text-vintage-gold transition-colors mx-auto" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-40 flex space-x-3">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative group transition-all duration-300 ${
                  index === currentIndex ? "w-12 h-4" : "w-4 h-4 hover:w-6"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                <div
                  className={`w-full h-full rounded-full border-2 transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-vintage-gold border-vintage-gold shadow-golden"
                      : "bg-vintage-cream/30 border-vintage-cream/50 hover:border-vintage-gold/70 hover:bg-vintage-gold/50"
                  }`}
                />
                {index === currentIndex && (
                  <div className="absolute inset-0 rounded-full bg-vintage-gold animate-pulse opacity-50"></div>
                )}
              </button>
            ))}
          </div>

          {/* Slide Counter */}
          <div className="absolute bottom-6 right-6 md:right-8 z-40 bg-vintage-dark/50 backdrop-blur-sm px-4 py-2 rounded-full border border-vintage-gold/30 text-vintage-cream vintage-sans">
            <span className="text-vintage-gold font-semibold">
              {String(currentIndex + 1).padStart(2, "0")}
            </span>
            <span className="mx-2 text-vintage-cream/60">/</span>
            <span className="text-vintage-cream/80">
              {String(bannerImages.length).padStart(2, "0")}
            </span>
          </div>
        </>
      )}

      {/* Decorative Border Lines */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-vintage-gold to-transparent z-30"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-vintage-gold to-transparent z-30"></div>
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-transparent via-vintage-gold to-transparent z-30"></div>
      <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-transparent via-vintage-gold to-transparent z-30"></div>
    </div>
  );
};

export default VintageBanner;
