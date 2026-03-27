import { GoogleGenerativeAI } from '@google/generative-ai';

export const GEMINI_MODELS = [
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (최고 품질)' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (균형, 추천)' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (저비용)' },
];

export async function generateWithGemini(
  prompt: string,
  model: string,
  systemPrompt?: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const genModel = genAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt ?? 'You are a helpful assistant that generates structured JSON content about Korean food and language learning. Always respond with valid JSON only.',
  });

  const result = await genModel.generateContent(prompt);
  return result.response.text();
}
