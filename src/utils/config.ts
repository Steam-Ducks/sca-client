export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  IS_PRODUCTION: import.meta.env.PROD,
  ENV_MODE: import.meta.env.MODE,

  ENABLE_LOGS: true,
  ENABLE_METRICS: true,
}