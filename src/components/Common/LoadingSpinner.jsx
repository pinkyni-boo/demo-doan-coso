import React from "react";
import { motion } from "framer-motion";

const LoadingSpinner = ({
  size = "md",
  color = "vintage-gold",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const borderClasses = {
    "vintage-gold": "border-vintage-gold",
    "vintage-accent": "border-vintage-accent",
    "vintage-primary": "border-vintage-primary",
    white: "border-white",
    "vintage-dark": "border-vintage-dark",
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 ${borderClasses[color]} border-t-transparent rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

export default LoadingSpinner;
