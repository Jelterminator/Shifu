import * as ort from 'onnxruntime-react-native';
// @ts-ignore
import { AutoTokenizer } from '@xenova/transformers';
import { AI_MODELS } from '../../config/AIConfig';
import { ModelLoader } from '../ModelLoader';

/** Default embedding dimension (MiniLM-L6-v2 uses 384) */
export const EMBEDDING_DIMENSIONS = 384;

/**
 * Embedder interface for dependency injection
 */
export interface Embedder {
  /** Generate embedding vector for text */
  embed(text: string): Promise<Float32Array>;
  /** Get the dimension of output embeddings */
  getDimensions(): number;
}

/**
 * Real Embedder using onnxruntime-react-native and all-MiniLM-L6-v2
 */
class OnnxEmbedder implements Embedder {
  private session: any = null;
  private tokenizer: any = null;
  private readonly dimensions = EMBEDDING_DIMENSIONS;

  async init() {
    if (this.session && this.tokenizer) return;

    try {
      // 1. Ensure Model
      const modelUrl = AI_MODELS.THE_INSTINCT.url;
      const fileName = AI_MODELS.THE_INSTINCT.fileName;
      console.log('[Embedder] Ensuring model exists:', fileName);
      const modelPath = await ModelLoader.ensureModel(modelUrl, fileName);

      // 2. Load Tokenizer
      if (!this.tokenizer) {
        console.log('[Embedder] Loading tokenizer...');
        this.tokenizer = await AutoTokenizer.from_pretrained('Xenova/all-MiniLM-L6-v2');
      }

      // 3. Load Session
      if (!this.session) {
        console.log('[Embedder] Loading ONNX session...');
        this.session = await ort.InferenceSession.create(modelPath, {
          executionProviders: ['cpu'], // Start simple
          graphOptimizationLevel: 'all',
        });
      }
    } catch (e) {
      console.error('[Embedder] Failed to initialize:', e);
      throw e;
    }
  }

  getDimensions(): number {
    return this.dimensions;
  }

  async embed(text: string): Promise<Float32Array> {
    await this.init();

    // Tokenize
    const { input_ids, attention_mask } = await this.tokenizer(text, {
      padding: true,
      truncation: true,
      return_tensor: 'ort',
    });

    // Inference
    const feeds = { input_ids, attention_mask };
    const results = await this.session.run(feeds);

    // Extract last_hidden_state (usually the first output: 'last_hidden_state' or 'logits' depending on export)
    // For sentence-transformers exports, it's usually 'last_hidden_state' or 'contextual'
    // Let's inspect keys if needed, but standard export has it as first output.
    const outputName = this.session.outputNames[0];
    const lastHiddenState = results[outputName]; // [batch, seq, hidden]

    // Mean Pooling
    return this.meanPooling(lastHiddenState, attention_mask);
  }

  /**
   * Performs mean pooling on the token embeddings, accounting for attention mask.
   */
  private meanPooling(lastHiddenState: any, attentionMask: any): Float32Array {
    // Shape: [batch_size, seq_len, hidden_size]
    // We assume batch_size = 1 for this client-side usage
    const [, seqLen, hidden] = lastHiddenState.dims;
    const data = lastHiddenState.data; // Float32Array
    const mask = attentionMask.data; // BigInt64Array or Int32Array (usually 1s and 0s)

    const pooled = new Float32Array(hidden).fill(0);
    let totalWeight = 0;

    // Loop over sequence
    for (let i = 0; i < seqLen; i++) {
      // Check mask (if 1, include)
      // mask is [batch, seqLen], here batch=0
      const isAttended = Number(mask[i]) === 1;

      if (isAttended) {
        const offset = i * hidden;
        for (let j = 0; j < hidden; j++) {
          pooled[j] += data[offset + j];
        }
        totalWeight++;
      }
    }

      if (totalWeight > 0) {
          for (let j = 0; j < hidden; j++) {
              pooled[j]! /= totalWeight;
          }
      }

      // Normalize (L2)
      let norm = 0;
      for (let j = 0; j < hidden; j++) {
          norm += pooled[j]! * pooled[j]!;
      }
      norm = Math.sqrt(norm);
      
      if (norm > 0) {
          for (let j = 0; j < hidden; j++) {
              pooled[j]! /= norm;
          }
      }

    return pooled;
  }
}

/**
 * Stub Embedder (Legacy/Fallback)
 */
export class StubEmbedder implements Embedder {
  getDimensions() {
    return EMBEDDING_DIMENSIONS;
  }
  async embed(_text: string) {
    return new Float32Array(384).fill(0.1);
  }
}

// Singleton instance
let embedderInstance: Embedder | null = null;

export function getEmbedder(): Embedder {
  if (!embedderInstance) {
    embedderInstance = new OnnxEmbedder();
  }
  return embedderInstance;
}

export function setEmbedder(embedder: Embedder): void {
  embedderInstance = embedder;
}

export function createStubEmbedder(): Embedder {
  return new StubEmbedder();
}
