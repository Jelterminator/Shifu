/* eslint-disable */
import { AgentLoop } from '../../src/services/ai/AgentLoop';
import { generateResponse } from '../../src/services/ai/Inference';
import { routeTools } from '../../src/services/ai/ToolRegistry';
import { useUserStore } from '../../src/stores/userStore';

// Mock everything before imports if possible, or use jest.mock
jest.mock('../../src/services/ai/ToolRegistry');
jest.mock('../../src/services/ai/Inference', () => ({
  generateResponse: jest.fn(),
  parsePlan: jest.requireActual('../../src/utils/aiUtils').parsePlan,
  unloadModel: jest.fn(),
}));
jest.mock('../../src/stores/userStore');
jest.mock('../../src/db/vectorStorage');
jest.mock('../../src/services/ai/ToolExecutor', () => ({
  executeTools: jest.fn().mockResolvedValue(['Mock Execution Result']),
}));

// Mock Expo and ONNX to prevent "install" errors
jest.mock('onnxruntime-react-native', () => ({
  InferenceSession: { create: jest.fn().mockResolvedValue({ inputNames: [] }) },
  Tensor: jest.fn(),
}));

jest.mock('@xenova/transformers', () => ({
  AutoTokenizer: { from_pretrained: jest.fn() },
  pipeline: jest.fn(),
}));

describe('AgentLoop Hallucination Prevention', () => {
  let agent: AgentLoop;

  beforeEach(() => {
    (AgentLoop as any).instance = null;
    agent = AgentLoop.getInstance();
    (useUserStore.getState as jest.Mock).mockReturnValue({ user: { id: 'test-user' } });
    jest.clearAllMocks();
  });

  it('should skip tool generation and synthesize directly when no tools are relevant', async () => {
    (routeTools as jest.Mock).mockResolvedValue([]);

    // In this case, generateResponse should ONLY be called for synthesizeResponse (which calls it with buildDirectPrompt)
    (generateResponse as jest.Mock).mockResolvedValue('Direct conversation answer');

    const result = await agent.executeUserRequest('Hello there');

    expect(routeTools).toHaveBeenCalledWith('Hello there');
    // generateResponse should be called once for synthesis
    expect(generateResponse).toHaveBeenCalledTimes(1);
    expect(result).toBe('Direct conversation answer');
  });

  it('should filter out hallucinated tool names that were not in relevantTools', async () => {
    const relevantTool = { name: 'get_tasks', parameters: {} };
    (routeTools as jest.Mock).mockResolvedValue([relevantTool]);

    // Mock the LLM hallucinating a tool 'climb_trees' alongside 'get_tasks'
    const plan = JSON.stringify([
      { tool: 'get_tasks', args: {} },
      { tool: 'climb_trees', args: {} },
    ]);

    (generateResponse as jest.Mock)
      .mockResolvedValueOnce(plan) // Step 3: plan generation
      .mockResolvedValueOnce('Final Synth'); // Step 6: synthesis

    const response = await agent.executeUserRequest('List my tasks and also climb a tree');

    const { executeTools } = require('../../src/services/ai/ToolExecutor');
    // Only get_tasks should be executed
    expect(executeTools).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ tool: 'get_tasks' })]),
      'test-user'
    );

    // Verify that climb_trees was NOT passed to executeTools
    const calls = (executeTools as jest.Mock).mock.calls;
    const executedSteps = calls[0][0];
    expect(executedSteps).toHaveLength(1);
    expect(executedSteps[0].tool).toBe('get_tasks');
    expect(response).toBe('Final Synth');
  });
});
