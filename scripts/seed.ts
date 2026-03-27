/**
 * seed.ts
 * -------
 * scripts/output/*.json 파일들을 읽어 SQL을 생성하고
 * wrangler d1 execute 로 로컬 D1 DB에 삽입합니다.
 * (better-sqlite3 네이티브 모듈 불필요)
 *
 * 사용법:
 *   npm run db:seed   ← 로컬 D1
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

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

// ─── SQL 헬퍼 ─────────────────────────────────────────────────────────────────

const now = () => Math.floor(Date.now() / 1000);

function esc(val: string | null | undefined): string {
  if (val == null) return 'NULL';
  return `'${val.replace(/'/g, "''")}'`;
}

function buildSQL(recipe: GeneratedRecipe): string {
  const lines: string[] = [];
  const ts = now();

  // ── recipes ──
  lines.push(`
INSERT OR IGNORE INTO recipes (
  slug, title_kr, title_en, romanization, description, cultural_note,
  difficulty, cooking_time, servings, region,
  instructions, tips, k_drama_appearances,
  meta_title, meta_description, keywords,
  published, ai_provider, ai_model, created_at, updated_at
) VALUES (
  ${esc(recipe.slug)},
  ${esc(recipe.titleKr)},
  ${esc(recipe.titleEn)},
  ${esc(recipe.romanization)},
  ${esc(recipe.description)},
  ${esc(recipe.culturalNote)},
  ${esc(recipe.difficulty)},
  ${recipe.cookingTime},
  ${recipe.servings},
  ${esc(recipe.region)},
  ${esc(JSON.stringify(recipe.instructions))},
  ${esc(JSON.stringify(recipe.tips ?? []))},
  ${esc(JSON.stringify(recipe.kDramaAppearances ?? []))},
  ${esc(recipe.metaTitle)},
  ${esc(recipe.metaDescription)},
  ${esc(JSON.stringify(recipe.keywords ?? []))},
  1,
  ${esc(recipe.aiProvider)},
  ${esc(recipe.aiModel)},
  ${ts}, ${ts}
);`);

  // ── ingredients + recipe_ingredients ──
  for (const ing of recipe.ingredients ?? []) {
    lines.push(`
INSERT OR IGNORE INTO ingredients (
  slug, name_kr, name_en, romanization,
  description, substitute, where_to_find, storage_note, created_at
) VALUES (
  ${esc(ing.slug)}, ${esc(ing.nameKr)}, ${esc(ing.nameEn)}, ${esc(ing.romanization)},
  ${esc(ing.description)}, ${esc(ing.substitute)}, ${esc(ing.whereToFind)}, ${esc(ing.storageNote)},
  ${ts}
);`);

    lines.push(`
INSERT OR IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, note, order_index)
SELECT r.id, i.id, ${esc(ing.amount)}, ${esc(ing.unit)}, ${esc(ing.note)}, ${ing.orderIndex}
FROM recipes r, ingredients i
WHERE r.slug = ${esc(recipe.slug)} AND i.slug = ${esc(ing.slug)};`);
  }

  // ── korean_phrases ──
  for (const p of recipe.phrases ?? []) {
    lines.push(`
INSERT INTO korean_phrases (
  recipe_id, phrase_kr, phrase_en, romanization,
  part_of_speech, level, grammar_point, grammar_explanation,
  example_kr, example_romanization, example_en,
  usage_note, context_type, created_at
)
SELECT r.id,
  ${esc(p.phraseKr)}, ${esc(p.phraseEn)}, ${esc(p.romanization)},
  ${esc(p.partOfSpeech)}, ${esc(p.level)},
  ${esc(p.grammarPoint)}, ${esc(p.grammarExplanation)},
  ${esc(p.exampleKr)}, ${esc(p.exampleRomanization)}, ${esc(p.exampleEn)},
  ${esc(p.usageNote)}, ${esc(p.contextType ?? 'cooking')},
  ${ts}
FROM recipes r WHERE r.slug = ${esc(recipe.slug)}
AND NOT EXISTS (
  SELECT 1 FROM korean_phrases kp
  JOIN recipes r2 ON kp.recipe_id = r2.id
  WHERE r2.slug = ${esc(recipe.slug)} AND kp.phrase_kr = ${esc(p.phraseKr)}
);`);
  }

  // ── quizzes ──
  for (const q of recipe.quizzes ?? []) {
    lines.push(`
INSERT INTO quizzes (recipe_id, type, difficulty, question, options, answer, explanation, created_at)
SELECT r.id,
  ${esc(q.type)}, ${esc(q.difficulty)}, ${esc(q.question)},
  ${esc(q.options ? JSON.stringify(q.options) : null)},
  ${esc(q.answer)}, ${esc(q.explanation)},
  ${ts}
FROM recipes r WHERE r.slug = ${esc(recipe.slug)}
AND NOT EXISTS (
  SELECT 1 FROM quizzes qz
  JOIN recipes r2 ON qz.recipe_id = r2.id
  WHERE r2.slug = ${esc(recipe.slug)} AND qz.question = ${esc(q.question)}
);`);
  }

  return lines.join('\n');
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

async function seed() {
  const outputDir = path.join(process.cwd(), 'scripts', 'output');

  if (!fs.existsSync(outputDir)) {
    console.error('❌ scripts/output/ 폴더가 없습니다. 먼저 npm run generate 또는 npm run mock 을 실행하세요.');
    process.exit(1);
  }

  const jsonFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.json'));

  if (jsonFiles.length === 0) {
    console.error('❌ scripts/output/ 에 JSON 파일이 없습니다.');
    process.exit(1);
  }

  console.log(`\n🇰🇷 Seed 시작 — ${jsonFiles.length}개 파일 발견\n${'─'.repeat(48)}`);

  const tmpPath = path.join(process.cwd(), 'scripts', '_seed_tmp.sql');
  let allSQL = '';
  let success = 0;
  let skipped = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(outputDir, file);
    console.log(`📄 처리 중: ${file}`);
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const recipe: GeneratedRecipe = JSON.parse(raw);
      allSQL += buildSQL(recipe);
      console.log(`  ✅ ${recipe.titleEn} (${recipe.titleKr})`);
      success++;
    } catch (err) {
      console.error(`  ❌ 실패:`, err instanceof Error ? err.message : err);
      skipped++;
    }
  }

  // SQL 파일 저장 후 wrangler로 실행
  fs.writeFileSync(tmpPath, allSQL, 'utf-8');

  try {
    execSync(
      `npx wrangler d1 execute korean-food-db --local --file=${tmpPath}`,
      { stdio: 'inherit' }
    );
  } finally {
    fs.unlinkSync(tmpPath);
  }

  console.log(`\n${'─'.repeat(48)}`);
  console.log(`🎉 Seed 완료! ✅ ${success}개 처리${skipped > 0 ? ` / ❌ ${skipped}개 실패` : ''}\n`);
}

seed().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
