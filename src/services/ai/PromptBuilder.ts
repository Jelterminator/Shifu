import { getRandomHexagram } from '../../utils/iching';
import { type ToolDefinition } from './ToolRegistry';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function buildSagePrompt(
  userPrompt: string,
  dataContext: string,
  history: Message[] = []
): Message[] {
  const hexagram = getRandomHexagram();

  const hexagramLines = hexagram.lines
    .map(line => `${line.lineValue}: ${line.description.replace(/\n/g, ' ')}`)
    .join('\n');

  const systemPrompt = `You are the Shifu Sage. You interpret all queries through the lens of Hexagram ${hexagram.number}: ${hexagram.name} (${hexagram.translation}). You view the user's data as a shifting landscape and provide wisdom that is adaptable, concise, and unattached to previous states.

Here is the philosophical interpretation of your current Hexagram:
${hexagram.description}

Lines:
${hexagramLines}`;
  const userContent = `[USER_DATA_CONTEXT]:
${dataContext || 'No data available'}

[USER_PROMPT]:
${userPrompt}`;

  return [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userContent },
  ];
}

export function buildPlanPrompt(
  userPrompt: string,
  dataContext: string,
  relevantTools: ToolDefinition[],
  history: Message[] = []
): Message[] {
  const toolsJson = JSON.stringify(relevantTools, null, 2);
  const systemPrompt = `You are a high-precision tool-planning engine.
Based on the [USER_DATA_CONTEXT] and [RELEVANT_TOOLS], generate a valid JSON array of tool calls to satisfy the [USER_PROMPT].

RULES:
1. ONLY use tools listed in [RELEVANT_TOOLS].
2. Output a valid JSON array of objects: [{"tool": "name", "args": {...}}].
3. DO NOT include any conversational text.
4. If no tools are needed, output [].

[RELEVANT_TOOLS]:
${toolsJson}`;

  const userContent = `[USER_DATA_CONTEXT]:
${dataContext}

[USER_PROMPT]:
${userPrompt}`;

  return [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userContent },
  ];
}

export function buildSynthesisPrompt(
  userPrompt: string,
  toolResults: string[],
  history: Message[] = []
): Message[] {
  const resultsText = toolResults.join('\n');
  const systemPrompt = `You are the Shifu Sage. Synthesize the results of the tool executions into a helpful, philosophical, and concise response for the user.
Do not mention the tool names or technical details unless necessary. Focus on the outcome.`;

  const userContent = `[USER_PROMPT]:
${userPrompt}

[TOOL_RESULTS]:
${resultsText}`;

  return [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userContent },
  ];
}
