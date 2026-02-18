import { useUserStore } from '../../stores/userStore';
import { normalizeStep, parsePlan, type PlanStep } from '../../utils/aiUtils';
import { generateResponse, unloadModel } from './Inference';
import { buildActionMessages, buildDirectPrompt, buildSynthesisPrompt } from './PromptBuilder';
import { executeTools } from './ToolExecutor';
import { routeTools } from './ToolRegistry';

// -----------------------------------------------------------------------------
// AgentLoop — Thin Orchestrator
// -----------------------------------------------------------------------------

export class AgentLoop {
  private static instance: AgentLoop;

  private constructor() {}

  static getInstance(): AgentLoop {
    if (!AgentLoop.instance) {
      AgentLoop.instance = new AgentLoop();
    }
    return AgentLoop.instance;
  }

  /**
   * Main entry point: execute a user request end-to-end.
   *
   * Flow: routeTools → buildPrompt → infer → execute → synthesize
   */
  async executeUserRequest(prompt: string): Promise<string> {
    try {
      // 1. Route Tools (The Instinct)
      const relevantTools = await routeTools(prompt);

      let results: string[] = [];

      if (relevantTools.length > 0) {
        // 2. Build Messages
        const messages = buildActionMessages(relevantTools, prompt);

        // 3. Generate Plan (The Brain)
        const planJson = await generateResponse(messages, true);

        // 4. Parse & Guard
        const rawSteps = parsePlan(planJson);

        // Normalize and filter hallucinations
        const selectedToolNames = new Set(relevantTools.map(t => t.name));
        const executionSteps = rawSteps.map(normalizeStep).filter((step): step is PlanStep => {
          if (!step) return false;
          return selectedToolNames.has(step.tool);
        });

        // 5. Execute Native (The Body)
        const userId = useUserStore.getState().user?.id;
        if (!userId) throw new Error('User not logged in');

        if (executionSteps.length > 0) {
          results = await executeTools(executionSteps, userId);
        }
      }

      // 6. Synthesize (The Voice)
      const finalResponse = await this.synthesizeResponse(prompt, results);
      return finalResponse;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return `I'm sorry, I encountered an internal error: ${message}`;
    } finally {
      unloadModel();
    }
  }

  private async synthesizeResponse(originalPrompt: string, toolResults: string[]): Promise<string> {
    if (toolResults.length === 0) {
      return generateResponse(buildDirectPrompt(originalPrompt), false);
    }
    return generateResponse(buildSynthesisPrompt(originalPrompt, toolResults), false);
  }
}
