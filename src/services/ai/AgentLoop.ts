import { useUserStore } from '../../stores/userStore';
import { normalizeStep, parsePlan } from '../../utils/aiUtils';
import { generateResponse, unloadModel } from './Inference';
import {
  buildActionMessages,
  buildDirectPrompt,
  buildSynthesisPrompt,
} from './PromptBuilder';
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
    console.log(`[AgentLoop] Starting execution for: "${prompt}"`);

    try {
      // 1. Route Tools (The Instinct)
      const relevantTools = await routeTools(prompt);
      console.log(`[AgentLoop] Selected tools: ${relevantTools.map(t => t.name).join(', ')}`);

      let results: string[] = [];

      if (relevantTools.length > 0) {
        // 2. Build Messages
        const messages = buildActionMessages(relevantTools, prompt);
        console.log('[AgentLoop] Messages:', JSON.stringify(messages, null, 2));

        // 3. Generate Plan (The Brain)
        const planJson = await generateResponse(messages, true);
        console.log('[AgentLoop] RAW Model Output:', planJson);

        // 4. Parse & Guard
        const rawSteps = parsePlan(planJson);
        
        // Normalize and filter hallucinations
        const selectedToolNames = new Set(relevantTools.map(t => t.name));
        let executionSteps = rawSteps
            .map(normalizeStep)
            .filter(step => {
                if (!step) return false;
                if (!selectedToolNames.has(step.tool)) {
                    console.warn(`[AgentLoop] Filtering hallucinated tool: ${step.tool}`);
                    return false;
                }
                return true;
            });

        console.log('[AgentLoop] Parsed Plan:', executionSteps);

        // 5. Execute Native (The Body)
        const userId = useUserStore.getState().user?.id;
        if (!userId) throw new Error('User not logged in');

        if (executionSteps.length > 0) {
            results = await executeTools(executionSteps, userId);
        }
      } else {
        console.log('[AgentLoop] No relevant tools found. Skipping plan phase.');
      }

      console.log('[AgentLoop] Execution Results:', results);

      // 6. Synthesize (The Voice)
      const finalResponse = await this.synthesizeResponse(prompt, results);
      return finalResponse;
    } catch (error) {
      console.error('[AgentLoop] Critical Error:', error);
      return "I'm sorry, I encountered an internal error while processing your request.";
    } finally {
      await unloadModel();
    }
  }

  private async synthesizeResponse(
    originalPrompt: string,
    toolResults: string[]
  ): Promise<string> {
    if (toolResults.length === 0) {
      return generateResponse(buildDirectPrompt(originalPrompt), false);
    }
    return generateResponse(buildSynthesisPrompt(originalPrompt, toolResults), false);
  }
}
