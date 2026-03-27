/**
 * seed.ts
 * -------
 * scripts/output/*.json 파일들을 읽어 로컬 D1 DB에 삽입합니다.
 *
 * 사용법:
 *   npm run db:seed            ← 로컬 D1
 *   npm run db:seed -- --prod  ← 프로덕션 D1 (주의)
 *
 * 전제조건:
 *   1. npm run db:migrate:local 실행 완료
 *   2. scripts/output/ 폴더에 generate.ts로 만든 *.json 파일 존재
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import Database from 'better-sqlite3';

dotenv.config({ path: '.env.local' });

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

interface GeneratedInstruction {
  step: number;
  textEn: string;
  koreanExpression?: string;
  grammarNote?: string | null;
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
  instructions: GeneratedInstruction[];
  tips?: string[];
  kDramaAppearances?: { drama: string; episode: string; note: string }[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ingredients: GeneratedIngredient[];
  phrases: GeneratedPhrase[];
  quizzes: GeneratedQuiz[];
  aiProvider?: string;
  aiModel?: string;
}

// ─── DB 연결 (로컬 D1 = .wrangler/state/v3/d1/ 아래 sqlite 파일) ──────────────

function getLocalDB(): InstanceType<typeof Database> {
  // wrangler dev가 만드는 로컬 D1 파일 경로
  const wranglerDir = path.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1');

  let dbPath: string | null = null;

  if (fs.existsSync(wranglerDir)) {
    // 가장 최근 DB 파일 찾기
    const files = fs.readdirSync(wranglerDir, { recursive: true }) as string[];
    const sqliteFiles = files.filter(f => f.endsWith('.sqlite'));
    if (sqliteFiles.length > 0) {
      dbPath = path.join(wranglerDir, sqliteFiles[sqliteFiles.length - 1]!);
    }
  }

  if (!dbPath) {
    // fallback: 로컬 테스트용 sqlite 파일 직접 생성
    dbPath = path.join(process.cwd(), 'local-dev.sqlite');
    console.log(`⚠️  Wrangler D1 파일을 찾지 못해 ${dbPath} 를 사용합니다.`);
    console.log('   먼저 "npm run dev" 또는 "wrangler d1 execute" 를 실행해 D1 을 초기화하세요.\n');
  }

  console.log(`📂 DB 경로: ${dbPath}\n`);
  return new Database(dbPath);
}

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

const now = () => Math.floor(Date.now() / 1000);

function upsertIngredient(db: InstanceType<typeof Database>, ing: GeneratedIngredient): number {
  const existing = db.prepare('SELECT id FROM ingredients WHERE slug = ?').get(ing.slug) as { id: number } | undefined;
  if (existing) return existing.id;

  const result = db.prepare(`
    INSERT INTO ingredients (slug, name_kr, name_en, romanization, description, substitute, where_to_find, storage_note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ing.slug, ing.nameKr, ing.nameEn, ing.romanization,
    ing.description ?? null, ing.substitute ?? null,
    ing.whereToFind ?? null, ing.storageNote ?? null,
    now()
  );
  return result.lastInsertRowid as number;
}

function insertRecipe(db: InstanceType<typeof Database>, recipe: GeneratedRecipe): number | null {
  const existing = db.prepare('SELECT id FROM recipes WHERE slug = ?').get(recipe.slug) as { id: number } | undefined;
  if (existing) {
    console.log(`  ⏩ 이미 존재: ${recipe.slug} (skip)`);
    return null;
  }

  const result = db.prepare(`
    INSERT INTO recipes (
      slug, title_kr, title_en, romanization, description, cultural_note,
      difficulty, cooking_time, servings, region,
      instructions, tips, k_drama_appearances,
      meta_title, meta_description, keywords,
      published, ai_provider, ai_model, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    recipe.slug,
    recipe.titleKr,
    recipe.titleEn,
    recipe.romanization,
    recipe.description,
    recipe.culturalNote ?? null,
    recipe.difficulty,
    recipe.cookingTime,
    recipe.servings,
    recipe.region ?? null,
    JSON.stringify(recipe.instructions),
    JSON.stringify(recipe.tips ?? []),
    JSON.stringify(recipe.kDramaAppearances ?? []),
    recipe.metaTitle ?? null,
    recipe.metaDescription ?? null,
    JSON.stringify(recipe.keywords ?? []),
    1,  // published = true (검토 후 false로 바꾸고 싶으면 0)
    recipe.aiProvider ?? null,
    recipe.aiModel ?? null,
    now(),
    now()
  );

  return result.lastInsertRowid as number;
}

function insertRecipeIngredients(
  db: InstanceType<typeof Database>,
  recipeId: number,
  ingredients: GeneratedIngredient[]
) {
  const stmt = db.prepare(`
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, note, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const ing of ingredients) {
    const ingId = upsertIngredient(db, ing);
    stmt.run(recipeId, ingId, ing.amount, ing.unit ?? null, ing.note ?? null, ing.orderIndex);
  }
}

function insertPhrases(
  db: InstanceType<typeof Database>,
  recipeId: number,
  phrases: GeneratedPhrase[]
) {
  const stmt = db.prepare(`
    INSERT INTO korean_phrases (
      recipe_id, phrase_kr, phrase_en, romanization,
      part_of_speech, level, grammar_point, grammar_explanation,
      example_kr, example_romanization, example_en,
      usage_note, context_type, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of phrases) {
    stmt.run(
      recipeId, p.phraseKr, p.phraseEn, p.romanization,
      p.partOfSpeech ?? null, p.level,
      p.grammarPoint ?? null, p.grammarExplanation ?? null,
      p.exampleKr ?? null, p.exampleRomanization ?? null, p.exampleEn ?? null,
      p.usageNote ?? null, p.contextType ?? 'cooking',
      now()
    );
  }
}

function insertQuizzes(
  db: InstanceType<typeof Database>,
  recipeId: number,
  quizzes: GeneratedQuiz[]
) {
  const stmt = db.prepare(`
    INSERT INTO quizzes (recipe_id, type, difficulty, question, options, answer, explanation, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const q of quizzes) {
    stmt.run(
      recipeId, q.type, q.difficulty, q.question,
      q.options ? JSON.stringify(q.options) : null,
      q.answer, q.explanation ?? null,
      now()
    );
  }
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

async function seed() {
  const outputDir = path.join(process.cwd(), 'scripts', 'output');

  if (!fs.existsSync(outputDir)) {
    console.error('❌ scripts/output/ 폴더가 없습니다. 먼저 npm run generate 를 실행하세요.');
    process.exit(1);
  }

  const jsonFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.json'));

  if (jsonFiles.length === 0) {
    console.error('❌ scripts/output/ 에 JSON 파일이 없습니다. npm run generate 를 먼저 실행하세요.');
    process.exit(1);
  }

  console.log(`\n🇰🇷 Seed 시작 — ${jsonFiles.length}개 파일 발견\n${'─'.repeat(48)}`);

  const db = getLocalDB();

  // 마이그레이션이 안 되어 있으면 자동 실행
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='recipes'").get();
  if (!tableExists) {
    console.log('⚙️  테이블이 없습니다. 마이그레이션을 먼저 실행하세요:');
    console.log('   npm run db:migrate:local\n');
    process.exit(1);
  }

  let success = 0;
  let skipped = 0;
  let failed  = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(outputDir, file);
    console.log(`\n📄 처리 중: ${file}`);

    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const recipe: GeneratedRecipe = JSON.parse(raw);

      // 트랜잭션으로 묶기 (원자적 삽입)
      const insertAll = db.transaction(() => {
        const recipeId = insertRecipe(db, recipe);
        if (!recipeId) { skipped++; return; }

        insertRecipeIngredients(db, recipeId, recipe.ingredients ?? []);
        insertPhrases(db, recipeId, recipe.phrases ?? []);
        insertQuizzes(db, recipeId, recipe.quizzes ?? []);

        console.log(`  ✅ ${recipe.titleEn} (${recipe.titleKr})`);
        console.log(`     재료: ${recipe.ingredients?.length ?? 0}개 | 표현: ${recipe.phrases?.length ?? 0}개 | 퀴즈: ${recipe.quizzes?.length ?? 0}개`);
        success++;
      });

      insertAll();

    } catch (err) {
      console.error(`  ❌ 실패:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  // ── 결과 요약 ──
  console.log(`\n${'─'.repeat(48)}`);
  console.log(`🎉 Seed 완료!`);
  console.log(`   ✅ 성공: ${success}개`);
  console.log(`   ⏩ 스킵: ${skipped}개 (이미 존재)`);
  if (failed > 0) console.log(`   ❌ 실패: ${failed}개`);

  // ── DB 현황 출력 ──
  const recipeCount     = (db.prepare('SELECT COUNT(*) as c FROM recipes').get() as { c: number }).c;
  const ingredientCount = (db.prepare('SELECT COUNT(*) as c FROM ingredients').get() as { c: number }).c;
  const phraseCount     = (db.prepare('SELECT COUNT(*) as c FROM korean_phrases').get() as { c: number }).c;
  const quizCount       = (db.prepare('SELECT COUNT(*) as c FROM quizzes').get() as { c: number }).c;

  console.log(`\n📊 DB 현황:`);
  console.log(`   recipes:        ${recipeCount}개`);
  console.log(`   ingredients:    ${ingredientCount}개`);
  console.log(`   korean_phrases: ${phraseCount}개`);
  console.log(`   quizzes:        ${quizCount}개\n`);

  db.close();
}

seed().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
