export const AI_MODELS = {
  // Example model: Xenova/mobilebert-uncased-sst-2
  // We point to the raw .onnx file on Hugging Face or a CDN
  // "The Brain": onnx-community/SmolLM2-1.7B-Instruct (4-bit quantized)
  // Fallback: onnx-community/Qwen2.5-0.5B-Instruct (4-bit quantized)
  THE_BRAIN_HIGH: {
    id: 'smollm2-1.7b-instruct',
    repoId: 'HuggingFaceTB/SmolLM2-1.7B-Instruct',
    url: 'https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct/resolve/main/onnx/model_int8.onnx',
    fileName: 'smollm2-1.7b-instruct-int8.onnx',
    dtype: 'q8',
  },
  THE_BRAIN_MID: {
    id: 'smollm2-360m-instruct',
    repoId: 'HuggingFaceTB/SmolLM2-360M-Instruct',
    url: 'https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct/resolve/main/onnx/model_int8.onnx',
    fileName: 'smollm2-360m-instruct-int8.onnx',
    dtype: 'q8',
  },
  THE_BRAIN_LOW: {
    id: 'smollm2-135m-instruct',
    repoId: 'HuggingFaceTB/SmolLM2-135M-Instruct',
    url: 'https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct/resolve/main/onnx/model_uint8.onnx',
    fileName: 'smollm2-135m-instruct-uint8.onnx',
    dtype: 'q8',
  },
  // "The Instinct": all-MiniLM-L6-v2 (Embedding model)
  THE_INSTINCT: {
    id: 'all-minilm-l6-v2',
    url: 'https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/main/onnx/model_quantized.onnx',
    fileName: 'all-minilm-l6-v2-quantized.onnx',
  },
};

export const MODEL_DIRECTORY = 'models/';
