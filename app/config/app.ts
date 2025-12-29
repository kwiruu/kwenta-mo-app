export const APP_CONFIG = {
  name: "KwentaMo",
  description: "A Web-Based Costing Assistant for Small Food Business Owners",
  version: "1.0.0",

  // API Configuration (to be updated when backend is ready)
  api: {
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    timeout: 30000,
  },

  // Feature Flags
  features: {
    bulkUpload: true,
    financialReports: true,
    notifications: true,
    darkMode: true,
  },

  // Business Configuration
  business: {
    defaultCurrency: "PHP",
    defaultOverheadRate: 0.15, // 15% overhead allocation
    lowStockThreshold: 10,
    profitMarginWarning: 0.1, // 10% minimum profit margin
  },

  // Pagination
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },

  // File Upload
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    acceptedFormats: [".xlsx", ".xls", ".csv"],
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
