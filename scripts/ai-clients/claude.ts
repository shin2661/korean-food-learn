import Anthropic from '@anthropic-ai/sdk';

export const CLAUDE_MODELS = [
  { id: 'claude-opus-4-6', label: 'Claude Opus 4.6 (최고 품질, 느림)' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (균형, 추천)' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (빠름, 저비용)' },
];

export async function generateWithClaude(
  prompt: string,
  model: string,
  systemPrompt?: string
): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt ?? 'You are a helpful assistant that generates structured JSON content about Korean food and language learning. Always respond with valid JSON only.',
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  return content.text;
}
