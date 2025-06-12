import React from "react";
import "../../styles/vintage-global.css";

export const VintageContainer = ({ children, className = "", ...props }) => (
  <div
    className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const VintageSection = ({
  children,
  className = "",
  background = "cream",
  ...props
}) => {
  const bgClass = {
    cream: "bg-vintage-cream",
    warm: "bg-vintage-warm",
    gradient: "bg-vintage-gradient",
    primary: "bg-vintage-primary",
  }[background];

  return (
    <section className={`py-16 ${bgClass} ${className}`} {...props}>
      {children}
    </section>
  );
};

export const VintageCard = ({
  children,
  type = "default",
  className = "",
  ...props
}) => {
  const cardClass = type === "luxury" ? "vintage-card-luxury" : "vintage-card";

  return (
    <div className={`${cardClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const VintageHeading = ({
  level = 1,
  children,
  className = "",
  ornament = false,
  ...props
}) => {
  const Tag = `h${level}`;
  const ornamentClass = ornament ? "vintage-ornament" : "";

  const sizeClasses = {
    1: "text-4xl md:text-5xl lg:text-6xl",
    2: "text-3xl md:text-4xl lg:text-5xl",
    3: "text-2xl md:text-3xl lg:text-4xl",
    4: "text-xl md:text-2xl lg:text-3xl",
    5: "text-lg md:text-xl lg:text-2xl",
    6: "text-base md:text-lg lg:text-xl",
  };

  return (
    <Tag
      className={`vintage-heading ${sizeClasses[level]} ${ornamentClass} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

export const VintageText = ({
  children,
  variant = "body",
  className = "",
  ...props
}) => {
  const variantClasses = {
    body: "vintage-body text-base md:text-lg",
    subtitle: "vintage-subheading text-lg md:text-xl",
    caption: "vintage-body text-sm md:text-base text-vintage-neutral",
    lead: "vintage-body text-lg md:text-xl text-vintage-dark",
  };

  return (
    <p className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </p>
  );
};

export const VintageButton = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  ...props
}) => {
  const variantClasses = {
    primary: "btn-vintage-primary",
    secondary: "btn-vintage-secondary",
    gold: "btn-vintage-gold",
  };

  const sizeClasses = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  return (
    <button
      className={`${variantClasses[variant]} ${
        sizeClasses[size]
      } ${className} ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Đang xử lý...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export const VintageInput = ({
  label,
  error,
  className = "",
  required = false,
  ...props
}) => (
  <div className="space-y-2">
    {label && (
      <label className="block vintage-subheading text-sm font-medium text-vintage-dark">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <input
      className={`vintage-input ${error ? "border-red-500" : ""} ${className}`}
      {...props}
    />
    {error && <p className="text-red-500 text-sm vintage-sans">{error}</p>}
  </div>
);

export const VintageDivider = ({ className = "" }) => (
  <div className={`vintage-divider ${className}`} />
);

export const VintageGrid = ({
  children,
  cols = { sm: 1, md: 2, lg: 3 },
  gap = 6,
  className = "",
  ...props
}) => {
  const gridClasses = `grid grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg} gap-${gap}`;

  return (
    <div className={`${gridClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

// Vintage Modal Component
export const VintageModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-vintage-dark bg-opacity-50"
          onClick={onClose}
        />

        <div
          className={`inline-block align-bottom vintage-card transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full ${className}`}
        >
          <div className="px-6 py-4 bg-vintage-warm border-b border-vintage-primary border-opacity-20">
            <div className="flex items-center justify-between">
              <VintageHeading level={3} className="text-vintage-dark">
                {title}
              </VintageHeading>
              <button
                onClick={onClose}
                className="text-vintage-neutral hover:text-vintage-dark transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-6 bg-white">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Vintage Navigation Component
export const VintageNav = ({ children, className = "" }) => (
  <nav
    className={`bg-white shadow-vintage border-b border-vintage-primary border-opacity-20 ${className}`}
  >
    {children}
  </nav>
);

// Vintage Hero Section
export const VintageHero = ({
  title,
  subtitle,
  children,
  backgroundImage,
  overlay = "vintage",
  className = "",
}) => (
  <section
    className={`vintage-hero relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}
  >
    {/* Background Image */}
    <div
      className="absolute inset-0 z-banner-bg"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />

    {/* Overlay for text contrast */}
    <div
      className={`absolute inset-0 z-banner-overlay ${
        overlay === "vintage"
          ? "banner-overlay-vintage"
          : overlay === "dark"
          ? "banner-overlay-dark"
          : overlay === "gradient"
          ? "banner-overlay-gradient"
          : "bg-black/40"
      }`}
    />

    {/* Content */}
    <VintageContainer className="relative z-banner-content">
      <div className="text-center text-white max-w-5xl mx-auto">
        <VintageHeading
          level={1}
          className="text-5xl md:text-7xl lg:text-8xl mb-6 text-white text-shadow-strong vintage-heading font-bold"
        >
          {title}
        </VintageHeading>

        <VintageText
          variant="lead"
          className="text-xl md:text-2xl mb-12 text-vintage-cream text-shadow-soft leading-relaxed max-w-4xl mx-auto"
        >
          {subtitle}
        </VintageText>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          {children}
        </div>
      </div>
    </VintageContainer>

    {/* Decorative elements */}
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-vintage-gold to-transparent z-banner-controls"></div>
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-vintage-gold to-transparent z-banner-controls"></div>
  </section>
);

export default VintageContainer;
