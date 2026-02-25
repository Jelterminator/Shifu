/**
 * leak-check.test.ts
 *
 * Verifies that importing cross-platform AI services does NOT trigger
 * top-level evaluation of web-only libraries (@huggingface/transformers)
 * or browser globals (navigator).
 */

// 1. Mock Platform.OS to simulate native
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: (obj: any) => obj.android ?? obj.default,
  },
}));

// 2. We do NOT want to mock @huggingface/transformers initially,
// because we want to see if it's evaluated.
// However, since it's a web/ESM package, Jest might fail to even LOAD it in Node.
// The goal of our fix is to ENSURE it's not even attempted to be loaded at top-level.

describe('AI Service Leakage Check', () => {
  it('should import Inference without triggering web-only side effects', async () => {
    // If Inference.ts imports Inference.web.ts and it has top-level side effects,
    // this import might fail if browser globals like 'navigator' are referenced,
    // or if the ESM-only package '@huggingface/transformers' is evaluated in CJS Jest.

    const { generateResponse } = require('../src/services/ai/Inference');
    expect(generateResponse).toBeDefined();
  });

  it('should import getEmbedder without triggering web-only side effects', async () => {
    const { getEmbedder } = require('../src/services/ai/embedder');
    expect(getEmbedder).toBeDefined();
  });
});
