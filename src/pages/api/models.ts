import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const headers = { 'Content-Type': 'application/json' };
  const provider = url.searchParams.get('provider');

  if (provider !== 'gemini') {
    return new Response(JSON.stringify({ error: 'Only gemini supports dynamic model listing' }), { status: 400, headers });
  }

  const runtimeEnv = (locals as any).runtime?.env ?? {};
  const apiKey: string | undefined = runtimeEnv.GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY가 설정되지 않았습니다. .env.local에 추가하거나 Cloudflare Secrets에 등록하세요.' }),
      { status: 400, headers },
    );
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
  );

  if (!res.ok) {
    const text = await res.text();
    return new Response(JSON.stringify({ error: `Gemini API error: ${text}` }), { status: 502, headers });
  }

  const data = await res.json() as { models?: { name: string; supportedGenerationMethods?: string[] }[] };

  const models = (data.models ?? [])
    .filter(m => m.name.startsWith('models/gemini-'))
    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
    .map(m => ({
      id: m.name.replace('models/', ''),   // "gemini-2.0-flash"
      label: m.name.replace('models/', ''), // display label
    }));

  return new Response(JSON.stringify({ models }), { status: 200, headers });
};
