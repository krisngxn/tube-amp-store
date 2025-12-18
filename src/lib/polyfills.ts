/**
 * Polyfills for ESM compatibility
 * This file should be imported early in the app to provide CommonJS globals
 */

// Polyfill __dirname for ESM (use process.cwd() as project root)
if (typeof (global as any).__dirname === 'undefined') {
  (global as any).__dirname = process.cwd();
}

// Also set it on globalThis for broader compatibility
if (typeof (globalThis as any).__dirname === 'undefined') {
  (globalThis as any).__dirname = process.cwd();
}

