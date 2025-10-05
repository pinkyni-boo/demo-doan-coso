// Logger utility để kiểm soát console output
const isDevelopment = import.meta.env.DEV;

export const logger = {
  // Chỉ log trong development mode
  debug: (...args) => {
    if (isDevelopment) {
      console.log('🔍', ...args);
    }
  },
  
  // Log thông tin quan trọng
  info: (...args) => {
    if (isDevelopment) {
      console.log('ℹ️', ...args);
    }
  },
  
  // Luôn log warnings
  warn: (...args) => {
    console.warn('⚠️', ...args);
  },
  
  // Luôn log errors
  error: (...args) => {
    console.error('❌', ...args);
  },
  
  // Log API responses (chỉ development)
  api: (endpoint, response) => {
    if (isDevelopment) {
      console.log(`🌐 API [${endpoint}]:`, response);
    }
  },
  
  // Log với throttling để tránh spam
  throttledWarn: (() => {
    const throttled = new Map();
    return (key, message, intervalMs = 60000) => {
      const now = Date.now();
      const lastLog = throttled.get(key);
      
      if (!lastLog || (now - lastLog) > intervalMs) {
        console.warn('⚠️', message);
        throttled.set(key, now);
      }
    };
  })(),
  
  // Performance logging
  time: (label) => {
    if (isDevelopment) {
      console.time(`⏱️ ${label}`);
    }
  },
  
  timeEnd: (label) => {
    if (isDevelopment) {
      console.timeEnd(`⏱️ ${label}`);
    }
  }
};

export default logger;