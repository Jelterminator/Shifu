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
  dataContext: string,
  history: Message[] = []
): Message[] {
  const hexagram = getRandomHexagram();

  const hexagramLines = hexagram.lines
    .map(line => `${line.lineValue}: ${line.description.replace(/\n/g, ' ')}`)
    .join('\n');

  const resultsText = toolResults.join('\n');
  const systemPrompt = `You are the Shifu Sage. Synthesize the results of the tool executions into a helpful, philosophical, and concise response for the user.
Do not mention the tool names or technical details unless necessary. Focus on the outcome.

You interpret all queries through the lens of Hexagram ${hexagram.number}: ${hexagram.name} (${hexagram.translation}). 

Here is the philosophical interpretation of your current Hexagram:
${hexagram.description}

Lines:
${hexagramLines}`;

  const userContent = `[USER_DATA_CONTEXT]:
${dataContext}

[USER_PROMPT]:
${userPrompt}

[TOOL_RESULTS]:
${resultsText}`;

  return [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userContent },
  ];
}

export function buildJournalInsightPrompt(
  dataContext: string,
  hexagram: { number: number; name: string; translation: string; description: string }
): Message[] {
  const systemPrompt = `You are a wise, philosophical AI Journal Companion. 
Provide a profound, concise daily insight for the user based on their recent life context, summaries, and today's I Ching Hexagram.
Keep it under 100 words. Focus on the essence and give an insight that is deeply compassionate yet challenging.

I Ching Focus - Hexagram ${hexagram.number}: ${hexagram.name} (${hexagram.translation})
${hexagram.description}

Synthesize this meaning with the user's recent data to provide today's insight.`;

  const userContent = `[USER_CONTEXT]:\n${dataContext}`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}

export function buildDailyScrapePrompt(dataContext: string): Message[] {
  const systemPrompt = `You are the Shifu Archiver, an AI that distills daily activities into concise, meaningful summaries.
You will be provided with a log of the user's executed plans (tasks, habits), journal entries, and spiritual practices for the day.
Write a clear, concise, and reflective summary of what the user experienced and accomplished. Focus on the core themes, emotional tone, and significant events.
Keep it under 150 words. Do not use filler introductions like "Today the user...". Just provide the summary.`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: dataContext },
  ];
}

export function buildRollupPrompt(
  targetType: 'weekly' | 'monthly' | 'quarterly',
  previousSummaries: string
): Message[] {
  const systemPrompt = `You are the Shifu Archiver. Your task is to synthesize multiple lower-level summaries into a single, cohesive ${targetType} summary.
Look for overarching trends, persistent themes, major shifts, and overall progress. The summary should read as a unified narrative of the ${targetType}.
Keep it concise, profound, and under 250 words. Do not list day-by-day events; focus on the macro perspective.`;

  const userContent = `Here are the summaries to synthesize:\n\n${previousSummaries}`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}
