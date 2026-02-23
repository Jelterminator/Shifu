import { useUserStore } from '../../stores/userStore';
import { normalizeStep, parsePlan, type PlanStep } from '../../utils/aiUtils';
import { generateResponse, unloadModel } from './Inference';
import { RAGMemoryScanner } from './MemoryScanner';
import {
  buildPlanPrompt,
  buildSagePrompt,
  buildSynthesisPrompt,
  type Message,
} from './PromptBuilder';
import { executeTools } from './ToolExecutor';
import { routeTools } from './ToolRegistry';

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
   * Main entry point: execute a user request end-to-end using the Sage architecture.
   */
  async executeUserRequest(prompt: string, history: Message[] = []): Promise<string> {
    try {
      const user = useUserStore.getState().user;
      const userId = user?.id;

      let dataContext = '';

      if (userId) {
        try {
          dataContext = `User Info: ${user.name || 'Unknown'} (Timezone: ${user.timezone})\n\n`;
          // Phase 1: Semantic Scrape (RAG)
          const scrapedMemory = await RAGMemoryScanner.buildContext(prompt, userId);
          dataContext += scrapedMemory;
        } catch (e) {
          console.warn('Failed to scrape user data', e);
        }
      }

      // Phase 2: Tool Routing (Instinct)
      const relevantTools = await routeTools(prompt);

      // If no tools are relevant, go direct to Sage Synthesis
      if (!relevantTools || relevantTools.length === 0) {
        const messages = buildSagePrompt(prompt, dataContext.trim(), history);
        return await generateResponse(messages, false);
      }

      // Phase 3: Tool Planning (Brain)
      const planMessages = buildPlanPrompt(prompt, dataContext, relevantTools, history);
      const rawPlan = await generateResponse(planMessages, true);

      // Phase 4: Parsing & Cleaning
      const parsed = parsePlan(rawPlan);
      const filteredSteps = parsed
        .map(normalizeStep)
        .filter((s): s is PlanStep => s !== null && relevantTools.some(t => t.name === s.tool));

      // Phase 5: Tool Execution (Body)
      let toolResults: string[] = [];
      if (filteredSteps.length > 0 && userId) {
        toolResults = await executeTools(filteredSteps, userId);
      } else {
        // If the model produced no valid steps or refused tools
        const messages = buildSagePrompt(prompt, dataContext.trim(), history);
        return await generateResponse(messages, false);
      }

      // Phase 6: Final Synthesis
      const synthesisMessages = buildSynthesisPrompt(
        prompt,
        toolResults,
        dataContext.trim(),
        history
      );
      const finalResponse = await generateResponse(synthesisMessages, false);

      return finalResponse.trim();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return `I'm sorry, I encountered an internal error: ${message}`;
    } finally {
      unloadModel();
    }
  }
}
