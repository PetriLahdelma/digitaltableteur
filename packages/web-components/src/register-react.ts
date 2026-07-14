import { defineReactElements } from "./react";

void defineReactElements().catch((error: unknown) => {
  queueMicrotask(() => {
    throw error;
  });
});
