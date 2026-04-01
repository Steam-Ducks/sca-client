const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// Alerta preventivo para Mixed Content em produção
if (import.meta.env.PROD && apiBaseUrl.startsWith('http:') && !apiBaseUrl.includes('localhost')) {
  console.warn('CUIDADO: Você está tentando usar uma API HTTP em um ambiente de produção HTTPS. Isso causará erros de Mixed Content.')
}

export const CONFIG = {
  API_BASE_URL: import.meta.env.PROD ? '/api' : apiBaseUrl,
  IS_PRODUCTION: import.meta.env.PROD,
  ENV_MODE: import.meta.env.MODE,

  ENABLE_LOGS: true,
  ENABLE_METRICS: true,
}