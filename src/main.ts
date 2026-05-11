import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/main.css";

import { logger } from "./utils/logger";

const app = createApp(App);

app.use(router);

app.config.errorHandler = (err, _instance, info) => {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? (err.stack ?? null) : null;
  logger.error("Vue error", { message, stack, info });
};

globalThis.addEventListener("error", (event) => {
  logger.error("Global error", {
    message: event.message,
    file: event.filename,
    line: event.lineno,
  });
});

globalThis.addEventListener("unhandledrejection", (event) => {
  const reason =
    event.reason instanceof Error
      ? event.reason.message
      : String(event.reason);
  logger.error("Promise rejected", { reason });
});

app.mount("#app");
