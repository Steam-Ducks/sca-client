import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

import { logger } from './utils/logger'

const app = createApp(App)

app.use(router)

app.config.errorHandler = (err, instance, info) => {
  logger.error('Vue error', {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : null,
    info,
  })
}

window.addEventListener('error', (event) => {
  logger.error('Global error', {
    message: event.message,
    file: event.filename,
    line: event.lineno,
  })
})

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Promise rejected', {
    reason:
      event.reason instanceof Error
        ? event.reason.message
        : String(event.reason),
  })
})

app.mount('#app')