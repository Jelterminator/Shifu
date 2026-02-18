import { AutoTokenizer } from '@xenova/transformers';
import * as ort from 'onnxruntime-react-native';
import { AI_MODELS } from '../../constants/AIConfig';
import { ModelLoader } from './ModelLoader';

interface EmbedTokenizer {
  (
    text: string,
    options: { padding: boolean; truncation: boolean; return_tensor: string }
  ): Promise<{
    input_ids: ort.Tensor;
    attention_mask: ort.Tensor;
  }>;
}

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
  private session: ort.InferenceSession | null = null;
  private tokenizer: EmbedTokenizer | null = null;
  private readonly dimensions = EMBEDDING_DIMENSIONS;

  async init(): Promise<void> {
    if (this.session && this.tokenizer) return;

    // 1. Ensure Model
    const modelUrl = AI_MODELS.THE_INSTINCT.url;
    const fileName = AI_MODELS.THE_INSTINCT.fileName;
    const modelPath = await ModelLoader.ensureModel(modelUrl, fileName);

    // 2. Load Tokenizer
    if (!this.tokenizer) {
      this.tokenizer = (await AutoTokenizer.from_pretrained(
        'Xenova/all-MiniLM-L6-v2'
      )) as unknown as EmbedTokenizer;
    }

    // 3. Load Session
    if (!this.session) {
      this.session = await ort.InferenceSession.create(modelPath, {
        executionProviders: ['cpu'], // Start simple
        graphOptimizationLevel: 'all',
      });
    }
  }

  getDimensions(): number {
    return this.dimensions;
  }

  async embed(text: string): Promise<Float32Array> {
    await this.init();
    if (!this.session || !this.tokenizer) throw new Error('Embedder not initialized');

    // Tokenize
    const { input_ids, attention_mask } = await this.tokenizer(text, {
      padding: true,
      truncation: true,
      return_tensor: 'ort',
    });

    // Inference
    const feeds = { input_ids, attention_mask };
    const results = await this.session.run(feeds);

    const outputName = this.session.outputNames[0];
    if (!outputName) throw new Error('No output names in session');
    const lastHiddenState = results[outputName]; // [batch, seq, hidden]
    if (!lastHiddenState) throw new Error(`Missing output ${outputName}`);

    // Mean Pooling
    return this.meanPooling(lastHiddenState, attention_mask);
  }

  /**
   * Performs mean pooling on the token embeddings, accounting for attention mask.
   */
  private meanPooling(lastHiddenState: ort.Tensor, attentionMask: ort.Tensor): Float32Array {
    // Shape: [batch_size, seq_len, hidden_size]
    // We assume batch_size = 1 for this client-side usage
    const dims = lastHiddenState.dims;
    const seqLen = dims[1];
    const hidden = dims[2];
    if (seqLen === undefined || hidden === undefined)
      throw new Error('Invalid hidden state dimensions');

    const data = lastHiddenState.data as Float32Array;
    const mask = attentionMask.data as BigInt64Array | Int32Array;

    const pooled = new Float32Array(hidden).fill(0);
    let totalWeight = 0;

    // Loop over sequence
    for (let i = 0; i < seqLen; i++) {
      const maskVal = mask[i];
      const isAttended = maskVal !== undefined && Number(maskVal) === 1;

      if (isAttended) {
        const offset = i * hidden;
        for (let j = 0; j < hidden; j++) {
          const val = data[offset + j];
          const current = pooled[j];
          if (val !== undefined && current !== undefined) {
            pooled[j] = current + val;
          }
        }
        totalWeight++;
      }
    }

    if (totalWeight > 0) {
      for (let j = 0; j < hidden; j++) {
        const val = pooled[j];
        if (val !== undefined) {
          pooled[j] = val / totalWeight;
        }
      }
    }

    // Normalize (L2)
    let norm = 0;
    for (let j = 0; j < hidden; j++) {
      const val = pooled[j];
      if (val !== undefined) {
        norm += val * val;
      }
    }
    norm = Math.sqrt(norm);

    if (norm > 0) {
      for (let j = 0; j < hidden; j++) {
        const val = pooled[j];
        if (val !== undefined) {
          pooled[j] = val / norm;
        }
      }
    }

    return pooled;
  }
}

/**
 * Stub Embedder (Legacy/Fallback)
 */
export class StubEmbedder implements Embedder {
  getDimensions(): number {
    return EMBEDDING_DIMENSIONS;
  }
  async embed(_text: string): Promise<Float32Array> {
    await Promise.resolve();
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
