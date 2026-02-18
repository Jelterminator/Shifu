/* eslint-disable */
import { AgentLoop } from '../../src/services/ai/AgentLoop';
import { getEmbedder } from '../../src/services/ai/embedder';
import { resetForTesting } from '../../src/services/ai/Inference';
import { useUserStore } from '../../src/stores/userStore';

// Repositories
import { appointmentRepository } from '../../src/db/repositories/AppointmentRepository';
import { habitRepository } from '../../src/db/repositories/HabitRepository';
import { planRepository } from '../../src/db/repositories/PlanRepository';
import { vectorStorage } from '../../src/db/vectorStorage';
import { AVAILABLE_TOOLS, routeTools } from '../../src/services/ai/ToolRegistry';
import { anchorsService } from '../../src/services/data/Anchors';
import { phaseManager } from '../../src/services/data/PhaseManager';

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
          data: new Float32Array(500),
        },
      }),
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
      (tokenizer as any).decode = jest.fn().mockReturnValue('[]');
      (tokenizer as any).apply_chat_template = jest.fn().mockReturnValue('mock prompt');
      (tokenizer as any).eos_token_id = 99;
      return tokenizer;
    }),
  },
}));

jest.mock('../../src/db/repositories/AppointmentRepository');
jest.mock('../../src/db/repositories/HabitRepository');
jest.mock('../../src/db/repositories/JournalRepository');
jest.mock('../../src/db/repositories/PlanRepository');
jest.mock('../../src/db/repositories/ProjectRepository');
jest.mock('../../src/db/repositories/TaskRepository');
jest.mock('../../src/services/data/Anchors');
jest.mock('../../src/db/vectorStorage');
jest.mock('../../src/services/data/PhaseManager');
jest.mock('../../src/services/ai/embedder');
jest.mock('../../src/stores/userStore');

describe('AgentLoop Secretary Tools', () => {
  let agent: AgentLoop;
  let mockTokenizer: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    (AgentLoop as any).instance = null;
    resetForTesting();
    agent = AgentLoop.getInstance();

    (useUserStore.getState as jest.Mock).mockReturnValue({ user: { id: 'test-user' } });
    (getEmbedder as jest.Mock).mockReturnValue({
      embed: jest.fn().mockResolvedValue(new Float32Array(384).fill(0.1)),
    });
    (phaseManager.getCurrentPhase as jest.Mock).mockReturnValue({
      name: 'WOOD',
      qualities: 'Growth',
    });

    const { AutoTokenizer } = require('@xenova/transformers');
    mockTokenizer = await AutoTokenizer.from_pretrained();
    AutoTokenizer.from_pretrained.mockResolvedValue(mockTokenizer);

    // Ensure router always returns our tools
    (routeTools as jest.Mock).mockResolvedValue(AVAILABLE_TOOLS);
  });

  const setupMockPlan = (plan: any[]) => {
    mockTokenizer.decode
      .mockReturnValueOnce(JSON.stringify(plan)) // First call for tool planning
      .mockReturnValueOnce('Done'); // Second call for synthesis
  };

  it('should execute get_agenda', async () => {
    setupMockPlan([{ tool: 'get_agenda', args: { date: '2026-02-14' } }]);
    (appointmentRepository.getForDate as jest.Mock).mockResolvedValue([]);
    (planRepository.getForDateRange as jest.Mock).mockResolvedValue([]);
    (anchorsService.getAnchorsForDate as jest.Mock).mockResolvedValue([]);

    await agent.executeUserRequest('What is my agenda for today?');

    expect(appointmentRepository.getForDate).toHaveBeenCalled();
    expect(planRepository.getForDateRange).toHaveBeenCalled();
    expect(anchorsService.getAnchorsForDate).toHaveBeenCalled();
  });

  it('should execute create_appointment', async () => {
    setupMockPlan([
      {
        tool: 'create_appointment',
        args: {
          name: 'Meeting',
          startTime: '2026-02-14T10:00:00Z',
          endTime: '2026-02-14T11:00:00Z',
        },
      },
    ]);
    (appointmentRepository.create as jest.Mock).mockResolvedValue({ id: 'apt-1', name: 'Meeting' });

    await agent.executeUserRequest('Schedule a meeting at 10am');

    expect(appointmentRepository.create).toHaveBeenCalledWith(
      'test-user',
      expect.objectContaining({
        name: 'Meeting',
        source: 'manual',
      })
    );
  });

  it('should execute add_habit', async () => {
    setupMockPlan([{ tool: 'add_habit', args: { title: 'Meditation', weeklyGoalMinutes: 60 } }]);
    (habitRepository.create as jest.Mock).mockResolvedValue({ id: 'h-1', title: 'Meditation' });

    await agent.executeUserRequest('Add a meditation habit for 60 mins a week');

    expect(habitRepository.create).toHaveBeenCalledWith(
      'test-user',
      expect.objectContaining({
        title: 'Meditation',
        weeklyGoalMinutes: 60,
      })
    );
  });

  it('should execute search_memory', async () => {
    setupMockPlan([{ tool: 'search_memory', args: { query: 'gardening' } }]);
    (vectorStorage.query as jest.Mock).mockResolvedValue([]);

    await agent.executeUserRequest('Search my notes for gardening');

    expect(vectorStorage.query).toHaveBeenCalledWith('test-user', expect.any(Float32Array), 5);
  });

  it('should execute get_status', async () => {
    setupMockPlan([{ tool: 'get_status', args: {} }]);
    (phaseManager.getCurrentPhase as jest.Mock).mockReturnValue({
      name: 'WOOD',
      qualities: 'Growth',
    });

    await agent.executeUserRequest('What is the current phase?');

    expect(phaseManager.getCurrentPhase).toHaveBeenCalled();
  });
});

