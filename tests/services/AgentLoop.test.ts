/* eslint-disable */
import { taskRepository } from '../../src/db/repositories/TaskRepository';
import { AgentLoop } from '../../src/services/ai/AgentLoop';
import { resetForTesting } from '../../src/services/ai/Inference';
import { routeTools } from '../../src/services/ai/ToolRegistry';
import { getEmbedder } from '../../src/services/ai/embedder';
import { useUserStore } from '../../src/stores/userStore';

// Mock Dependencies
jest.mock('../../src/services/ai/ToolRegistry', () => ({
  ...jest.requireActual('../../src/services/ai/ToolRegistry'),
  routeTools: jest.fn(),
}));

jest.mock('../../src/services/ai/ModelLoader', () => ({
  ModelLoader: {
    ensureModel: jest.fn().mockResolvedValue('/path/to/model.onnx'),
  },
}));

jest.mock('onnxruntime-react-native', () => ({
  InferenceSession: {
    create: jest.fn().mockResolvedValue({
      run: jest.fn().mockResolvedValue({
        logits: {
          dims: [1, 5, 100],
          data: new Float32Array(500), // Mock data
        },
      }),
      inputNames: [],
    }),
  },
  Tensor: jest.fn().mockImplementation((type, data, dims) => ({ type, data, dims })),
}));

jest.mock('@xenova/transformers', () => ({
  AutoTokenizer: {
    from_pretrained: jest.fn().mockImplementation(async () => {
      const tokenizer = jest.fn().mockResolvedValue({
        input_ids: { dims: [1, 5], data: new BigInt64Array(5) },
        attention_mask: { dims: [1, 5], data: new BigInt64Array(5) },
      });
      (tokenizer as any).encode = jest.fn().mockReturnValue({ input_ids: [], attention_mask: [] });
      (tokenizer as any).decode = jest.fn().mockReturnValue('["mock_tool_call"]');
      (tokenizer as any).apply_chat_template = jest.fn().mockReturnValue('mock prompt');
      (tokenizer as any).eos_token_id = 99;
      return tokenizer;
    }),
  },
}));

jest.mock('../../src/db/repositories/TaskRepository');
jest.mock('../../src/db/vectorStorage');
jest.mock('../../src/services/ai/embedder');
jest.mock('../../src/stores/userStore');
jest.mock('../../src/services/data/PhaseManager', () => ({
  phaseManager: {
    getCurrentPhase: jest.fn().mockReturnValue({ name: 'WOOD', qualities: 'Growth' }),
  },
}));

describe('AgentLoop', () => {
  let agent: AgentLoop;

  beforeEach(() => {
    (AgentLoop as any).instance = null;
    resetForTesting();
    agent = AgentLoop.getInstance();
    (useUserStore.getState as jest.Mock).mockReturnValue({ user: { id: 'test-user' } });
    (getEmbedder as jest.Mock).mockReturnValue({
      embed: jest.fn().mockResolvedValue(new Float32Array(384).fill(0.1)),
    });
    (routeTools as jest.Mock).mockResolvedValue([
      { name: 'create_task', shortDescription: 'Create a task', parameters: {} },
      { name: 'delete_task', shortDescription: 'Delete a task', parameters: {} },
    ]);
  });

  it('should be a singleton', () => {
    const agent2 = AgentLoop.getInstance();
    expect(agent).toBe(agent2);
  });

  it('should route tools and execute a plan', async () => {
    const mockPlan = JSON.stringify([{ tool: 'create_task', args: { title: 'Test Task' } }]);

    const mockTokenizerFn = jest.fn().mockResolvedValue({
      input_ids: { dims: [1, 5], data: new BigInt64Array(5) },
      attention_mask: { dims: [1, 5], data: new BigInt64Array(5) },
    });
    (mockTokenizerFn as any).decode = jest.fn().mockReturnValue(mockPlan);
    (mockTokenizerFn as any).apply_chat_template = jest.fn().mockReturnValue('mock prompt');
    (mockTokenizerFn as any).eos_token_id = 99;

    const AutoTokenizer = require('@xenova/transformers').AutoTokenizer;
    AutoTokenizer.from_pretrained.mockResolvedValue(mockTokenizerFn);

    // Mock Task Repo
    (taskRepository.create as jest.Mock).mockResolvedValue({ id: 'task-1', title: 'Test Task' });

    await agent.executeUserRequest('Create a task called Test Task');

    expect(taskRepository.create).toHaveBeenCalledWith(
      'test-user',
      expect.objectContaining({
        title: 'Test Task',
      })
    );
  });

  it('should handle JSON repair', async () => {
    const badJson = `[ { "tool": "delete_task", "args": { "id": "123" } , ]`; // Trailing comma / broken

    const mockTokenizerFn = jest.fn().mockResolvedValue({
      input_ids: { dims: [1, 5], data: new BigInt64Array(5) },
      attention_mask: { dims: [1, 5], data: new BigInt64Array(5) },
    });
    (mockTokenizerFn as any).encode = jest
      .fn()
      .mockReturnValue({ input_ids: [], attention_mask: [] });
    (mockTokenizerFn as any).decode = jest
      .fn()
      .mockReturnValueOnce(badJson)
      .mockReturnValueOnce('Done');
    (mockTokenizerFn as any).apply_chat_template = jest.fn().mockReturnValue('mock prompt');
    (mockTokenizerFn as any).eos_token_id = 99;

    const AutoTokenizer = require('@xenova/transformers').AutoTokenizer;
    AutoTokenizer.from_pretrained.mockResolvedValue(mockTokenizerFn);

    (taskRepository.delete as jest.Mock).mockResolvedValue(undefined);

    await agent.executeUserRequest('Delete task 123');

    expect(taskRepository.delete).toHaveBeenCalledWith('123');
  });
});
