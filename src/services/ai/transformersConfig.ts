// @ts-ignore
import { env } from '@huggingface/transformers';

/**
 * Configure transformers.js v3 environment for web.
 * Must be imported before any pipeline creation.
 *
 * We use @huggingface/transformers (v3) on web because it bundles
 * onnxruntime-web ~1.22 which supports ONNX IR version 10+.
 * The native build still uses @xenova/transformers with onnxruntime-react-native.
 */
export function configureTransformers() {
  env.allowLocalModels = false;
  env.useBrowserCache = true;

  // Serve ONNX Runtime WASM files locally to avoid tracking prevention issues
  if (env.backends.onnx?.wasm) {
    // @ts-ignore
    env.backends.onnx.wasm.wasmPaths = '/onnx/';
    // Disable proxy for WebGPU to reduce overhead
    // @ts-ignore
    env.backends.onnx.wasm.proxy = false;
    // @ts-ignore
    env.backends.onnx.logLevel = 'error';

    // 4 threads is often sweet spot for background WASM tasks
    const threads = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
    // @ts-ignore
    env.backends.onnx.wasm.numThreads = Math.min(threads, 4);
    // @ts-ignore
    env.backends.onnx.wasm.simd = true;
  }

  console.log(`[Transformers Config] Configured @huggingface/transformers v3 (Local WASM: ${env.backends.onnx?.wasm ? 'OK' : 'FAIL'}, Threads: ${env.backends.onnx?.wasm?.numThreads})`);
}
