import OpenAI from 'openai';

export const OPENAI_MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o (최고 품질)' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini (균형, 저비용)' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
];

export async function generateWithOpenAI(
  prompt: string,
  model: string,
  systemPrompt?: string
): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: systemPrompt ?? 'You are a helpful assistant that generates structured JSON content about Korean food and language learning. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  return response.choices[0].message.content ?? '';
}
