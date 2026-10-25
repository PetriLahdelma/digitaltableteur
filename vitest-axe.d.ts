/// <reference types="vitest" />

// Vitest 5 reads custom matcher types from `Matchers<R, T>` (R is the matcher
// return type, T the received value); it covers instance and asymmetric use.
declare module "vitest" {
  interface Matchers<R = unknown, T = unknown> {
    toHaveNoViolations(): R;
  }
}

export {};
