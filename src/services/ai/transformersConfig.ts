import { env } from '@huggingface/transformers';

/**
 * Configure transformers.js v3 environment for web.
 * Must be imported before any pipeline creation.
 *
 * We use @huggingface/transformers (v3) on web because it bundles
 * onnxruntime-web ~1.22 which supports ONNX IR version 10+.
 * The native build still uses @xenova/transformers with onnxruntime-react-native.
 */
export function configureTransformers(): void {
  env.allowLocalModels = false;
  env.useBrowserCache = true;

  // Serve ONNX Runtime WASM files locally to avoid tracking prevention issues
  const onnx = env.backends['onnx'] as Record<string, unknown>;
  if (onnx && typeof onnx === 'object') {
    const wasm = onnx['wasm'] as Record<string, unknown>;
    if (wasm && typeof wasm === 'object') {
      wasm['wasmPaths'] = '/onnx/';
      wasm['proxy'] = false;
      onnx['logLevel'] = 'error';

      // 4 threads is often sweet spot for background WASM tasks
      const threads = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
      wasm['numThreads'] = Math.min(threads, 4);
      wasm['simd'] = true;
    }
  }
}
