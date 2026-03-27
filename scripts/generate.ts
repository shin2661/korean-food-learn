import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

import { CLAUDE_MODELS, generateWithClaude } from './ai-clients/claude';
import { GEMINI_MODELS, generateWithGemini } from './ai-clients/gemini';
import { OPENAI_MODELS, generateWithOpenAI } from './ai-clients/openai';

dotenv.config({ path: '.env.local' });

// ─── Types (새 스키마에 맞춤) ─────────────────────────────────────────────────

type Provider = 'claude' | 'gemini' | 'openai';

interface AIConfig {
  provider: Provider;
  model: string;
}

interface GeneratedIngredient {
  slug: string;
  nameKr: string;
  nameEn: string;
  romanization: string;
  description: string;
  substitute: string;
  whereToFind: string;
  storageNote: string;
  // 레시피 내 사용 정보
  amount: string;
  unit: string | null;
  note: string | null;
  orderIndex: number;
}

interface GeneratedInstruction {
  step: number;
  textEn: string;
  koreanExpression: string;    // 이 단계에서 배울 한국어 표현
  grammarNote: string | null;  // 문법 포인트
}

interface GeneratedPhrase {
  phraseKr: string;
  phraseEn: string;
  romanization: string;
  partOfSpeech: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  grammarPoint: string | null;
  grammarExplanation: string | null;
  exampleKr: string;
  exampleRomanization: string;
  exampleEn: string;
  usageNote: string;
  contextType: string;
}

interface GeneratedQuiz {
  type: 'multiple_choice' | 'fill_blank' | 'translation' | 'matching';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

interface GeneratedRecipe {
  // recipes 테이블
  slug: string;
  titleKr: string;
  titleEn: string;
  romanization: string;
  description: string;
  culturalNote: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cookingTime: number;
  servings: number;
  region: string;
  instructions: GeneratedInstruction[];
  tips: string[];
  kDramaAppearances: { drama: string; episode: string; note: string }[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];

  // ingredients + recipe_ingredients 테이블
  ingredients: GeneratedIngredient[];

  // korean_phrases 테이블
  phrases: GeneratedPhrase[];

  // quizzes 테이블
  quizzes: GeneratedQuiz[];
}

// ─── CLI Helpers ──────────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> => new Promise((res) => rl.question(q, res));

function printMenu(title: string, options: { id: string; label: string }[]) {
  console.log(`\n${title}`);
  options.forEach((opt, i) => console.log(`  [${i + 1}] ${opt.label}`));
}

async function selectFromMenu(
  title: string,
  options: { id: string; label: string }[]
): Promise<string> {
  printMenu(title, options);
  while (true) {
    const input = await ask(`\n선택 (1-${options.length}): `);
    const idx = parseInt(input.trim()) - 1;
    if (idx >= 0 && idx < options.length) return options[idx].id;
    console.log('  ❌ 잘못된 입력입니다.');
  }
}

// ─── AI 선택 ──────────────────────────────────────────────────────────────────

async function selectAI(): Promise<AIConfig> {
  const providerOptions = [
    { id: 'claude', label: 'Claude (Anthropic)' },
    { id: 'gemini', label: 'Gemini (Google)' },
    { id: 'openai', label: 'OpenAI (GPT)' },
  ];

  const provider = (await selectFromMenu('🤖 AI Provider 선택', providerOptions)) as Provider;

  const modelOptions =
    provider === 'claude' ? CLAUDE_MODELS
    : provider === 'gemini' ? GEMINI_MODELS
    : OPENAI_MODELS;

  const model = await selectFromMenu(`📦 모델 선택`, modelOptions);

  console.log(`\n✅ ${provider} / ${model}\n`);
  return { provider, model };
}

// ─── AI 호출 통합 ─────────────────────────────────────────────────────────────

async function callAI(prompt: string, config: AIConfig, systemPrompt?: string): Promise<string> {
  switch (config.provider) {
    case 'claude': return generateWithClaude(prompt, config.model, systemPrompt);
    case 'gemini': return generateWithGemini(prompt, config.model, systemPrompt);
    case 'openai': return generateWithOpenAI(prompt, config.model, systemPrompt);
  }
}

function parseJSON<T>(raw: string): T {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as T;
}

// ─── 프롬프트 ─────────────────────────────────────────────────────────────────

function buildRecipePrompt(foodName: string): string {
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

// ─── 생성 & 저장 ──────────────────────────────────────────────────────────────

async function generateAndSave(foodName: string, aiConfig: AIConfig): Promise<void> {
  console.log(`\n⏳ "${foodName}" 생성 중... (${aiConfig.provider}/${aiConfig.model})`);

  const raw = await callAI(buildRecipePrompt(foodName), aiConfig);
  const recipe = parseJSON<GeneratedRecipe>(raw);

  // 메타데이터 추가
  const output = {
    ...recipe,
    aiProvider: aiConfig.provider,
    aiModel: aiConfig.model,
    generatedAt: new Date().toISOString(),
  };

  const outputDir = path.join(process.cwd(), 'scripts', 'output');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${recipe.slug}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`✅ 완료: ${recipe.titleEn} (${recipe.titleKr})`);
  console.log(`   📁 scripts/output/${recipe.slug}.json`);
  console.log(`   🥘 재료: ${recipe.ingredients.length}개`);
  console.log(`   📚 표현: ${recipe.phrases.length}개`);
  console.log(`   ❓ 퀴즈: ${recipe.quizzes.length}개`);
}

// ─── 메뉴 ─────────────────────────────────────────────────────────────────────

async function singleGenerate(aiConfig: AIConfig) {
  const name = (await ask('🍜 음식 이름 (한국어 또는 영어): ')).trim();
  if (!name) return console.log('❌ 이름을 입력해주세요.');
  await generateAndSave(name, aiConfig);
}

async function bulkGenerate(aiConfig: AIConfig) {
  const input = await ask('🍜 음식 목록 (쉼표 구분): ');
  const foods = input.split(',').map(f => f.trim()).filter(Boolean);
  if (!foods.length) return console.log('❌ 음식 이름을 입력해주세요.');

  console.log(`\n📋 ${foods.length}개 생성 시작...\n`);
  for (let i = 0; i < foods.length; i++) {
    try {
      await generateAndSave(foods[i], aiConfig);
    } catch (err) {
      console.error(`❌ "${foods[i]}" 실패:`, err);
    }
    if (i < foods.length - 1) await new Promise(r => setTimeout(r, 1200));
  }
  console.log('\n🎉 완료!');
}

// ─── 엔트리 ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🇰🇷 Korean Food & Language — 콘텐츠 생성 파이프라인');
  console.log('━'.repeat(52));

  const aiConfig = await selectAI();

  const actions = [
    { id: 'single', label: '레시피 1개 생성' },
    { id: 'bulk',   label: '레시피 여러 개 생성 (쉼표 구분)' },
    { id: 'exit',   label: '종료' },
  ];

  while (true) {
    const action = await selectFromMenu('⚙️  작업 선택', actions);
    if (action === 'single') await singleGenerate(aiConfig);
    else if (action === 'bulk') await bulkGenerate(aiConfig);
    else break;

    const cont = await ask('\n계속? (y/n): ');
    if (cont.trim().toLowerCase() !== 'y') break;
  }

  rl.close();
  console.log('\n👋 종료.\n');
}

main().catch(console.error);
