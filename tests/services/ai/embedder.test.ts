/* eslint-disable */
import * as ort from 'onnxruntime-react-native';
import { getEmbedder, setEmbedder } from '../../../src/services/ai/embedder';
import { ModelLoader } from '../../../src/services/ai/ModelLoader';

// Mocks
jest.mock('onnxruntime-react-native', () => ({
  InferenceSession: {
    create: jest.fn(),
  },
}));

jest.mock('@xenova/transformers', () => ({
  AutoTokenizer: {
    from_pretrained: jest.fn(),
  },
}));

jest.mock('../../../src/services/ai/ModelLoader', () => ({
  ModelLoader: {
    ensureModel: jest.fn().mockResolvedValue('/path/to/minilm.onnx'),
  },
}));

describe('OnnxEmbedder', () => {
  let mockSession: any;
  let mockTokenizer: any;

  beforeEach(() => {
    jest.clearAllMocks();
    setEmbedder(null as any);

    // Setup Mock Session
    mockSession = {
      outputNames: ['last_hidden_state'],
      run: jest.fn().mockImplementation(async () => {
        // Return an object where keys are output names
        return {
          last_hidden_state: {
            dims: [1, 3, 384], // Default shape, tests can override
            data: new Float32Array(3 * 384),
          },
        };
      }),
    };
    (ort.InferenceSession.create as jest.Mock).mockResolvedValue(mockSession);

    // Setup Mock Tokenizer
    // Should return input_ids and attention_mask
    const mockEncode = jest.fn().mockResolvedValue({
      input_ids: { dims: [1, 3], data: new BigInt64Array([101n, 200n, 102n]) },
      attention_mask: { dims: [1, 3], data: new BigInt64Array([1n, 1n, 1n]) },
    });
    mockTokenizer = jest.fn().mockImplementation(mockEncode);

    // Require here to allow mock injection
    const AutoTokenizer = require('@xenova/transformers').AutoTokenizer;
    AutoTokenizer.from_pretrained.mockResolvedValue(mockTokenizer);
  });

  it('should initialize and load model', async () => {
    const embedder = getEmbedder();
    await embedder.embed('hello');

    expect(ModelLoader.ensureModel).toHaveBeenCalled();
    expect(ort.InferenceSession.create).toHaveBeenCalledWith(
      '/path/to/minilm.onnx',
      expect.any(Object)
    );
  });

  it('should calculate mean pooling correctly', async () => {
    // 1 Sequence of length 2 (plus padding?)
    // Let's manually construct a case.
    // Batch=1, Seq=2, Hidden=2 for simplicity of calculation check
    // Tokens: [A, B]
    // A vector: [1.0, 0.0]
    // B vector: [0.0, 1.0]
    // Mean: [0.5, 0.5]
    // Norm: sqrt(0.5^2 + 0.5^2) = sqrt(0.25+0.25) = sqrt(0.5) ~= 0.707
    // Normalized Mean: [0.5/0.707, 0.5/0.707] = [0.707, 0.707]

    // Mock run output
    const mockOutputData = new Float32Array([1.0, 0.0, 0.0, 1.0]); // Flat [1, 2, 2]
    mockSession.run.mockResolvedValue({
      last_hidden_state: {
        dims: [1, 2, 2],
        data: mockOutputData,
      },
    });

    // Mock tokenizer output for this case
    const mockEncode = jest.fn().mockResolvedValue({
      input_ids: { dims: [1, 2], data: new BigInt64Array([1n, 2n]) },
      attention_mask: { dims: [1, 2], data: new BigInt64Array([1n, 1n]) },
    });
    mockTokenizer.mockImplementation(mockEncode);

    const embedder = getEmbedder();
    // Use 'as any' to access private/dimensions if needed,
    // but we can just check the result length if we don't change dimension constant.
    // However, the test runs with actual Constants. EMBEDDING_DIMENSIONS is 384.
    // But our mock data simulates dim=2.
    // The OnnxEmbedder code uses `hidden` from `dims`, not the constant `dimensions` for calculation.
    // So it should work with mock data of any size.

    const vector = await embedder.embed('test');

    expect(vector.length).toBe(2);
    expect(vector[0]).toBeCloseTo(0.7071);
    expect(vector[1]).toBeCloseTo(0.7071);
  });

  it('should handle padding correctly', async () => {
    // Seq=3. [A, B, PAD]
    // Mask: [1, 1, 0]
    // Data: [1,0], [0,1], [9,9] (PAD garbage)
    // Mean should basically identical to previous case (ignoring 3rd token)

    const mockOutputData = new Float32Array([1.0, 0.0, 0.0, 1.0, 9.0, 9.0]);
    mockSession.run.mockResolvedValue({
      last_hidden_state: {
        dims: [1, 3, 2],
        data: mockOutputData,
      },
    });

    const mockEncode = jest.fn().mockResolvedValue({
      input_ids: { dims: [1, 3], data: new BigInt64Array([1n, 2n, 0n]) },
      attention_mask: { dims: [1, 3], data: new BigInt64Array([1n, 1n, 0n]) },
    });
    mockTokenizer.mockImplementation(mockEncode);

    const embedder = getEmbedder();
    const vector = await embedder.embed('test padded');

    expect(vector.length).toBe(2);
    expect(vector[0]).toBeCloseTo(0.7071);
    expect(vector[1]).toBeCloseTo(0.7071);
  });
});

