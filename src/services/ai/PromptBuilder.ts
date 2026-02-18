import type { ToolDefinition } from './ToolRegistry';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// -----------------------------------------------------------------------------
// Prompt Construction
// -----------------------------------------------------------------------------

/**
 * Build the system prompt for ACTION mode (JSON ONLY).
 */
/**
 * Build messages for ACTION mode (JSON ONLY).
 */
export function buildActionMessages(tools: ToolDefinition[], userPrompt: string): Message[] {
  const toolSchemas = tools.map(t => ({
    tool: t.name,
    desc: t.shortDescription,
    params: t.parameters,
  }));

  const system = `You are Shifu. JSON ONLY.
Tools: ${JSON.stringify(toolSchemas)}
Example: [{ "tool": "create_task", "args": { "title": "Buy milk" } }]
If none, return [].`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: userPrompt },
  ];
}

/**
 * Build the system prompt for SYNTHESIS mode (Conversational).
 */
export function buildVoicePrompt(): string {
  return `You are Shifu, a wise coach and secretary for a life tracking app. 
Be helpful, concise, and maintain your persona.`;
}

/**
 * Build a direct-answer prompt (no tools needed).
 */
export function buildDirectPrompt(userMessage: string): Message[] {
  return [
    { role: 'system', content: buildVoicePrompt() },
    { role: 'user', content: userMessage },
  ];
}

/**
 * Build messages for SYNTHESIS mode (Conversational).
 */
export function buildSynthesisPrompt(originalPrompt: string, toolResults: string[]): Message[] {
  const content = `User Request: "${originalPrompt}"\nResults: ${JSON.stringify(toolResults)}\nSummarize what was done.`;
  return [
    { role: 'system', content: buildVoicePrompt() },
    { role: 'user', content: content },
  ];
}

// buildDirectPrompt is already moved up above.
