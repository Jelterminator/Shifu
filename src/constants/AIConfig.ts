export const AI_MODELS = {
  // Example model: Xenova/mobilebert-uncased-sst-2
  // We point to the raw .onnx file on Hugging Face or a CDN
  // "The Brain": onnx-community/Qwen2.5-0.5B-Instruct (4-bit quantized)
  THE_BRAIN: {
    id: 'qwen2.5-0.5b-instruct',
    url: 'https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct/resolve/main/onnx/model_q4f16.onnx',
    fileName: 'qwen2.5-0.5b-instruct-q4f16.onnx',
  },
  // "The Instinct": all-MiniLM-L6-v2 (Embedding model)
  THE_INSTINCT: {
    id: 'all-minilm-l6-v2',
    url: 'https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/main/onnx/model_quantized.onnx',
    fileName: 'all-minilm-l6-v2-quantized.onnx',
  },
};

export const MODEL_DIRECTORY = 'models/';
