import { defineElements } from "./index";

void defineElements().catch((error: unknown) => {
  queueMicrotask(() => {
    throw error;
  });
});
