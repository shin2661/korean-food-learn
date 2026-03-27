import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import { recipes, ingredients, recipeIngredients, koreanPhrases, quizzes } from '@db/schema';
import { eq } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export const prerender = false;

// ─── Types ────────────────────────────────────────────────────────────────────

interface GeneratedIngredient {
  slug: string;
  nameKr: string;
  nameEn: string;
  romanization: string;
  description?: string;
  substitute?: string;
  whereToFind?: string;
  storageNote?: string;
  amount: string;
  unit?: string | null;
  note?: string | null;
  orderIndex: number;
}

interface GeneratedPhrase {
  phraseKr: string;
  phraseEn: string;
  romanization: string;
  partOfSpeech?: string;
  level: string;
  grammarPoint?: string | null;
  grammarExplanation?: string | null;
  exampleKr?: string;
  exampleRomanization?: string;
  exampleEn?: string;
  usageNote?: string;
  contextType?: string;
}

interface GeneratedQuiz {
  type: string;
  difficulty: string;
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

interface GeneratedRecipe {
  slug: string;
  titleKr: string;
  titleEn: string;
  romanization: string;
  description: string;
  culturalNote?: string;
  difficulty: string;
  cookingTime: number;
  servings: number;
  region?: string;
  instructions: { step: number; textEn: string; koreanExpression?: string; grammarNote?: string | null }[];
  tips?: string[];
  kDramaAppearances?: { drama: string; episode: string; note: string }[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ingredients: GeneratedIngredient[];
  phrases: GeneratedPhrase[];
  quizzes: GeneratedQuiz[];
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(foodName: string): string {
  return `Generate a comprehensive Korean food + language learning page for "${foodName}".

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):

{
  "slug": "kebab-case-english-slug",
  "titleKr": "한국어 이름",
  "titleEn": "English Name",
  "romanization": "Romanized pronunciation",
  "description": "2-3 sentence SEO description for foreigners learning Korean through food",
  "culturalNote": "Interesting cultural background (2-3 sentences)",
  "difficulty": "easy|medium|hard",
  "cookingTime": 30,
  "servings": 4,
  "region": "Seoul|Nationwide|Jeonju|Busan|etc",
  "instructions": [
    {
      "step": 1,
      "textEn": "English cooking instruction",
      "koreanExpression": "관련 한국어 표현 (e.g. 볶다, 중불로 줄이다)",
      "grammarNote": "Optional grammar note e.g. '~아/어서 means because/and then'"
    }
  ],
  "tips": ["Tip 1 in English", "Tip 2"],
  "kDramaAppearances": [
    { "drama": "Drama Name", "episode": "S1E3", "note": "Context" }
  ],
  "metaTitle": "How to Make [Food] | Learn Korean Through Cooking",
  "metaDescription": "Under 160 chars",
  "keywords": ["kimchi stew recipe", "learn korean food vocabulary"],
  "ingredients": [
    {
      "slug": "kimchi",
      "nameKr": "김치",
      "nameEn": "Kimchi",
      "romanization": "kimchi",
      "description": "Fermented spicy cabbage, a Korean staple",
      "substitute": "Sauerkraut (less spicy, different flavor)",
      "whereToFind": "Asian grocery stores, online (H-Mart, Hankook)",
      "storageNote": "Refrigerate up to 3 months",
      "amount": "2",
      "unit": "cups",
      "note": "Aged kimchi preferred for deeper flavor",
      "orderIndex": 1
    }
  ],
  "phrases": [
    {
      "phraseKr": "끓이다",
      "phraseEn": "to boil",
      "romanization": "kkeulida",
      "partOfSpeech": "verb",
      "level": "beginner",
      "grammarPoint": "~아/어 주세요",
      "grammarExplanation": "Polite request form: 'Please [verb]'",
      "exampleKr": "물을 끓여 주세요",
      "exampleRomanization": "mureul kkeullyeo juseyo",
      "exampleEn": "Please boil the water",
      "usageNote": "Common in cooking instructions and restaurants",
      "contextType": "cooking"
    }
  ],
  "quizzes": [
    {
      "type": "multiple_choice",
      "difficulty": "easy",
      "question": "What does 김치 (kimchi) mean?",
      "options": ["Fermented vegetables", "Grilled meat", "Rice cake", "Spicy soup"],
      "answer": "Fermented vegetables",
      "explanation": "김치 is salted and fermented vegetables..."
    },
    {
      "type": "translation",
      "difficulty": "medium",
      "question": "Translate: 불을 중불로 줄여주세요",
      "answer": "Please reduce the heat to medium",
      "explanation": "중불 means medium heat, 줄이다 means to reduce"
    },
    {
      "type": "fill_blank",
      "difficulty": "hard",
      "question": "Complete: 김치찌개를 ___ 주세요 (Please boil the kimchi stew)",
      "answer": "끓여",
      "explanation": "끓이다 → 끓여 (verb stem + 어)"
    }
  ]
}

Requirements:
- 6-10 ingredients with full details
- 4-6 cooking steps, each with a Korean expression
- 8-12 Korean phrases (mix of beginner/intermediate/advanced)
- 5 quizzes (mix of all types and difficulties)
- Include 1-3 K-drama appearances if this dish appears in popular dramas
- All phrases must be directly relevant to cooking or eating this dish`;
}

// ─── AI Clients ───────────────────────────────────────────────────────────────

async function callClaude(foodName: string, model: string, apiKey: string): Promise<string> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: 'You are a helpful assistant that generates structured JSON content about Korean food and language learning. Always respond with valid JSON only.',
    messages: [{ role: 'user', content: buildPrompt(foodName) }],
  });
  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');
  return content.text;
}

async function callGemini(foodName: string, model: string, apiKey: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({
    model,
    systemInstruction: 'You are a helpful assistant that generates structured JSON content about Korean food and language learning. Always respond with valid JSON only.',
  });
  const result = await geminiModel.generateContent(buildPrompt(foodName));
  return result.response.text();
}

async function callOpenAI(foodName: string, model: string, apiKey: string): Promise<string> {
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that generates structured JSON content about Korean food and language learning. Always respond with valid JSON only.',
      },
      { role: 'user', content: buildPrompt(foodName) },
    ],
    response_format: { type: 'json_object' },
  });
  return response.choices[0]?.message?.content ?? '';
}

async function callGroq(foodName: string, model: string, apiKey: string): Promise<string> {
  const client = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that generates structured JSON content about Korean food and language learning. Always respond with valid JSON only.',
      },
      { role: 'user', content: buildPrompt(foodName) },
    ],
    response_format: { type: 'json_object' },
  });
  return response.choices[0]?.message?.content ?? '';
}

function parseJSON(raw: string): GeneratedRecipe {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as GeneratedRecipe;
}

// ─── DB Save ──────────────────────────────────────────────────────────────────

async function saveToDb(
  db: ReturnType<typeof getDB>,
  recipe: GeneratedRecipe,
  provider: string,
  model: string,
) {
  // Check for duplicate
  const existing = await db.select({ id: recipes.id })
    .from(recipes)
    .where(eq(recipes.slug, recipe.slug))
    .limit(1);

  if (existing.length > 0) {
    return { status: 'skipped' as const, slug: recipe.slug, titleEn: recipe.titleEn, titleKr: recipe.titleKr };
  }

  const now = new Date();

  // Insert recipe
  const [newRecipe] = await db.insert(recipes).values({
    slug: recipe.slug,
    titleKr: recipe.titleKr,
    titleEn: recipe.titleEn,
    romanization: recipe.romanization,
    description: recipe.description,
    culturalNote: recipe.culturalNote ?? null,
    difficulty: recipe.difficulty,
    cookingTime: recipe.cookingTime,
    servings: recipe.servings,
    region: recipe.region ?? null,
    instructions: JSON.stringify(recipe.instructions),
    tips: JSON.stringify(recipe.tips ?? []),
    kDramaAppearances: JSON.stringify(recipe.kDramaAppearances ?? []),
    metaTitle: recipe.metaTitle ?? null,
    metaDescription: recipe.metaDescription ?? null,
    keywords: JSON.stringify(recipe.keywords ?? []),
    published: true,
    aiProvider: provider,
    aiModel: model,
    createdAt: now,
    updatedAt: now,
  }).returning({ id: recipes.id });

  const recipeId = newRecipe!.id;

  // Insert ingredients (upsert by slug)
  for (const ing of recipe.ingredients ?? []) {
    let ingId: number;

    const existingIng = await db.select({ id: ingredients.id })
      .from(ingredients)
      .where(eq(ingredients.slug, ing.slug))
      .limit(1);

    if (existingIng.length > 0) {
      ingId = existingIng[0]!.id;
    } else {
      const [newIng] = await db.insert(ingredients).values({
        slug: ing.slug,
        nameKr: ing.nameKr,
        nameEn: ing.nameEn,
        romanization: ing.romanization,
        description: ing.description ?? null,
        substitute: ing.substitute ?? null,
        whereToFind: ing.whereToFind ?? null,
        storageNote: ing.storageNote ?? null,
        createdAt: now,
      }).returning({ id: ingredients.id });
      ingId = newIng!.id;
    }

    await db.insert(recipeIngredients).values({
      recipeId,
      ingredientId: ingId,
      amount: ing.amount,
      unit: ing.unit ?? null,
      note: ing.note ?? null,
      orderIndex: ing.orderIndex,
    });
  }

  // Insert phrases
  for (const p of recipe.phrases ?? []) {
    await db.insert(koreanPhrases).values({
      recipeId,
      phraseKr: p.phraseKr,
      phraseEn: p.phraseEn,
      romanization: p.romanization,
      partOfSpeech: p.partOfSpeech ?? null,
      level: p.level,
      grammarPoint: p.grammarPoint ?? null,
      grammarExplanation: p.grammarExplanation ?? null,
      exampleKr: p.exampleKr ?? null,
      exampleRomanization: p.exampleRomanization ?? null,
      exampleEn: p.exampleEn ?? null,
      usageNote: p.usageNote ?? null,
      contextType: p.contextType ?? 'cooking',
      createdAt: now,
    });
  }

  // Insert quizzes
  for (const q of recipe.quizzes ?? []) {
    await db.insert(quizzes).values({
      recipeId,
      type: q.type,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options ? JSON.stringify(q.options) : null,
      answer: q.answer,
      explanation: q.explanation ?? null,
      createdAt: now,
    });
  }

  return {
    status: 'created' as const,
    slug: recipe.slug,
    titleEn: recipe.titleEn,
    titleKr: recipe.titleKr,
    ingredientsCount: recipe.ingredients?.length ?? 0,
    phrasesCount: recipe.phrases?.length ?? 0,
    quizzesCount: recipe.quizzes?.length ?? 0,
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request, locals }) => {
  const headers = { 'Content-Type': 'application/json' };

  let body: { provider: string; model: string; foodName: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers });
  }

  const { provider, model, foodName } = body;

  if (!provider || !model || !foodName?.trim()) {
    return new Response(JSON.stringify({ error: 'provider, model, foodName are required' }), { status: 400, headers });
  }

  const env = (locals as any).runtime?.env ?? {};
  const apiKey: string | undefined =
    provider === 'claude'  ? env.ANTHROPIC_API_KEY
    : provider === 'gemini'  ? env.GEMINI_API_KEY
    : provider === 'groq'    ? env.GROQ_API_KEY
    : env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: `API key for "${provider}" is not configured. Set it in .dev.vars (local) or Cloudflare Secrets (production).` }),
      { status: 400, headers },
    );
  }

  try {
    let raw: string;
    if (provider === 'claude') {
      raw = await callClaude(foodName.trim(), model, apiKey);
    } else if (provider === 'gemini') {
      raw = await callGemini(foodName.trim(), model, apiKey);
    } else if (provider === 'groq') {
      raw = await callGroq(foodName.trim(), model, apiKey);
    } else {
      raw = await callOpenAI(foodName.trim(), model, apiKey);
    }

    const recipeData = parseJSON(raw);
    const db = getDB(locals);
    const result = await saveToDb(db, recipeData, provider, model);

    return new Response(JSON.stringify(result), { status: 200, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers });
  }
};
