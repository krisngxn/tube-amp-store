/**
 * Polyfills for ESM compatibility
 * This file should be imported early in the app to provide CommonJS globals
 */

// Polyfill __dirname for ESM (use process.cwd() as project root)
// This must be set before any code that might use __dirname
const projectDir = process.cwd();

// Set on global and globalThis
(global as any).__dirname = projectDir;
(globalThis as any).__dirname = projectDir;

// Also define it as a global variable using Object.defineProperty
// This makes it available as a direct variable reference
Object.defineProperty(global, '__dirname', {
  value: projectDir,
  writable: false,
  enumerable: false,
  configurable: false,
});

Object.defineProperty(globalThis, '__dirname', {
  value: projectDir,
  writable: false,
  enumerable: false,
  configurable: false,
});

