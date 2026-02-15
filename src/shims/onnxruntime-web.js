/**
 * Shim for onnxruntime-web on Expo/Metro web builds.
 *
 * Metro cannot parse onnxruntime-web's dist files because they contain
 * `import(/* webpackIgnore:true * / ...)` syntax. Instead, we load ONNX Runtime
 * from a CDN via a <script> tag and re-export the global `ort` object.
 *
 * This file is only used on web (via Metro resolver in metro.config.js).
 */

let ortLoaded = null;

function loadOrtFromCDN() {
  if (ortLoaded) return ortLoaded;

  ortLoaded = new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof globalThis !== 'undefined' && globalThis.ort) {
      resolve(globalThis.ort);
      return;
    }

    const script = document.createElement('script');
    script.src = '/onnx/ort.all.min.js';
    script.async = true;
    script.onload = () => {
      if (globalThis.ort) {
        resolve(globalThis.ort);
      } else {
        reject(new Error('ort global not found after script load'));
      }
    };
    script.onerror = () =>
      reject(new Error('Failed to load onnxruntime-web from CDN'));
    document.head.appendChild(script);
  });

  return ortLoaded;
}

// Create a proxy that lazy-loads ORT from CDN on first access
const handler = {
  get(_target, prop) {
    if (prop === '__esModule') return true;
    if (prop === 'default') return proxy;

    // For synchronous access (env, Tensor, etc.), check if already loaded
    if (globalThis.ort && globalThis.ort[prop] !== undefined) {
      return globalThis.ort[prop];
    }

    // Return a function that will load ORT first
    if (prop === 'InferenceSession') {
      return {
        create: async (...args) => {
          const ort = await loadOrtFromCDN();
          return ort.InferenceSession.create(...args);
        },
      };
    }
    if (prop === 'Tensor') {
      if (globalThis.ort && globalThis.ort.Tensor) {
        return globalThis.ort.Tensor;
      }
      // Tensor needs sync access, force load
      const TensorProxy = class {
        constructor(...args) {
          if (!globalThis.ort) {
            throw new Error(
              'ORT not loaded yet. Call loadOrtFromCDN() first.',
            );
          }
          return new globalThis.ort.Tensor(...args);
        }
        static [Symbol.hasInstance](instance) {
          return globalThis.ort && instance instanceof globalThis.ort.Tensor;
        }
      };
      return TensorProxy;
    }
    if (prop === 'env') {
      if (globalThis.ort) return globalThis.ort.env;
      // Return a stub env that will be populated later
      return {
        wasm: {},
        webgpu: {},
      };
    }

    // For other properties, try globalThis.ort
    if (globalThis.ort) return globalThis.ort[prop];
    return undefined;
  },
};

const proxy = new Proxy({}, handler);

// Eagerly start loading
loadOrtFromCDN().catch(() => {});

export const InferenceSession = proxy.InferenceSession;
export const Tensor = proxy.Tensor;
export const env = proxy.env;
export default proxy;
