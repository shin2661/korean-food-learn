/**
 * seed-prod.ts
 * ------------
 * scripts/output/*.json 을 Cloudflare D1 프로덕션에 직접 삽입합니다.
 * Wrangler CLI를 통해 SQL을 실행하는 방식이라 API 키 없이 동작합니다.
 *
 * 사용법:
 *   npm run db:seed:prod
 *
 * 전제조건:
 *   1. wrangler login 완료
 *   2. wrangler.toml 에 database_id 채워져 있을 것
 *   3. npm run db:migrate:prod 실행 완료
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface GeneratedIngredient {
  slug: string; nameKr: string; nameEn: string; romanization: string;
  description?: string; substitute?: string; whereToFind?: string; storageNote?: string;
  amount: string; unit?: string | null; note?: string | null; orderIndex: number;
}
interface GeneratedPhrase {
  phraseKr: string; phraseEn: string; romanization: string; partOfSpeech?: string;
  level: string; grammarPoint?: string | null; grammarExplanation?: string | null;
  exampleKr?: string; exampleRomanization?: string; exampleEn?: string;
  usageNote?: string; contextType?: string;
}
interface GeneratedQuiz {
  type: string; difficulty: string; question: string;
  options?: string[]; answer: string; explanation?: string;
}
interface GeneratedRecipe {
  slug: string; titleKr: string; titleEn: string; romanization: string;
  description: string; culturalNote?: string; difficulty: string;
  cookingTime: number; servings: number; region?: string;
  instructions: object[]; tips?: string[];
  kDramaAppearances?: object[]; metaTitle?: string; metaDescription?: string;
  keywords?: string[]; ingredients: GeneratedIngredient[];
  phrases: GeneratedPhrase[]; quizzes: GeneratedQuiz[];
  aiProvider?: string; aiModel?: string;
}

// ─── SQL 이스케이프 ────────────────────────────────────────────────────────────

function esc(val: string | null | undefined): string {
  if (val == null) return 'NULL';
  return `'${val.replace(/'/g, "''")}'`;
}

function escJson(val: unknown): string {
  return esc(JSON.stringify(val));
}

const now = () => Math.floor(Date.now() / 1000);

// ─── SQL 생성 ──────────────────────────────────────────────────────────────────

function buildSQL(recipe: GeneratedRecipe): string {
  const lines: string[] = [];

  // 1. Ingredients (upsert via INSERT OR IGNORE)
  for (const ing of recipe.ingredients ?? []) {
    lines.push(`
INSERT OR IGNORE INTO ingredients (slug, name_kr, name_en, romanization, description, substitute, where_to_find, storage_note, created_at)
VALUES (${esc(ing.slug)}, ${esc(ing.nameKr)}, ${esc(ing.nameEn)}, ${esc(ing.romanization)}, ${esc(ing.description)}, ${esc(ing.substitute)}, ${esc(ing.whereToFind)}, ${esc(ing.storageNote)}, ${now()});`.trim());
  }

  // 2. Recipe (INSERT OR IGNORE → skip if exists)
  lines.push(`
INSERT OR IGNORE INTO recipes (slug, title_kr, title_en, romanization, description, cultural_note, difficulty, cooking_time, servings, region, instructions, tips, k_drama_appearances, meta_title, meta_description, keywords, published, ai_provider, ai_model, created_at, updated_at)
VALUES (
  ${esc(recipe.slug)}, ${esc(recipe.titleKr)}, ${esc(recipe.titleEn)}, ${esc(recipe.romanization)},
  ${esc(recipe.description)}, ${esc(recipe.culturalNote)},
  ${esc(recipe.difficulty)}, ${recipe.cookingTime}, ${recipe.servings}, ${esc(recipe.region)},
  ${escJson(recipe.instructions)}, ${escJson(recipe.tips ?? [])}, ${escJson(recipe.kDramaAppearances ?? [])},
  ${esc(recipe.metaTitle)}, ${esc(recipe.metaDescription)}, ${escJson(recipe.keywords ?? [])},
  1, ${esc(recipe.aiProvider)}, ${esc(recipe.aiModel)}, ${now()}, ${now()}
);`.trim());

  // 3. recipe_ingredients (recipe_id를 서브쿼리로)
  let orderIdx = 1;
  for (const ing of recipe.ingredients ?? []) {
    lines.push(`
INSERT OR IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, note, order_index)
SELECT r.id, i.id, ${esc(ing.amount)}, ${esc(ing.unit)}, ${esc(ing.note)}, ${orderIdx}
FROM recipes r, ingredients i
WHERE r.slug = ${esc(recipe.slug)} AND i.slug = ${esc(ing.slug)};`.trim());
    orderIdx++;
  }

  // 4. korean_phrases
  for (const p of recipe.phrases ?? []) {
    lines.push(`
INSERT INTO korean_phrases (recipe_id, phrase_kr, phrase_en, romanization, part_of_speech, level, grammar_point, grammar_explanation, example_kr, example_romanization, example_en, usage_note, context_type, created_at)
SELECT id, ${esc(p.phraseKr)}, ${esc(p.phraseEn)}, ${esc(p.romanization)}, ${esc(p.partOfSpeech)}, ${esc(p.level)}, ${esc(p.grammarPoint)}, ${esc(p.grammarExplanation)}, ${esc(p.exampleKr)}, ${esc(p.exampleRomanization)}, ${esc(p.exampleEn)}, ${esc(p.usageNote)}, ${esc(p.contextType ?? 'cooking')}, ${now()}
FROM recipes WHERE slug = ${esc(recipe.slug)};`.trim());
  }

  // 5. quizzes
  for (const q of recipe.quizzes ?? []) {
    lines.push(`
INSERT INTO quizzes (recipe_id, type, difficulty, question, options, answer, explanation, created_at)
SELECT id, ${esc(q.type)}, ${esc(q.difficulty)}, ${esc(q.question)}, ${esc(q.options ? JSON.stringify(q.options) : null)}, ${esc(q.answer)}, ${esc(q.explanation)}, ${now()}
FROM recipes WHERE slug = ${esc(recipe.slug)};`.trim());
  }

  return lines.join('\n');
}

// ─── Wrangler 실행 ─────────────────────────────────────────────────────────────

function runWranglerSQL(sql: string, sqlFile: string, remote: boolean) {
  fs.writeFileSync(sqlFile, sql, 'utf-8');
  const flag = remote ? '--remote' : '--local';
  execSync(`wrangler d1 execute korean-food-db ${flag} --file="${sqlFile}"`, {
    stdio: 'inherit',
    encoding: 'utf-8',
  });
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

async function seedProd() {
  const args = process.argv.slice(2);
  const isRemote = args.includes('--prod');

  const outputDir = path.join(process.cwd(), 'scripts', 'output');
  const tmpDir    = path.join(process.cwd(), 'scripts', '_tmp');

  if (!fs.existsSync(outputDir)) {
    console.error('❌ scripts/output/ 폴더가 없습니다. npm run generate 를 먼저 실행하세요.');
    process.exit(1);
  }

  fs.mkdirSync(tmpDir, { recursive: true });

  const jsonFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.json'));
  if (!jsonFiles.length) {
    console.error('❌ JSON 파일이 없습니다.');
    process.exit(1);
  }

  const target = isRemote ? '🌐 Cloudflare D1 (프로덕션)' : '💻 로컬 D1';
  console.log(`\n🇰🇷 Wrangler Seed — ${target}`);
  console.log(`   파일 수: ${jsonFiles.length}개\n${'─'.repeat(48)}`);

  if (isRemote) {
    console.log('⚠️  프로덕션 D1에 씁니다. 5초 후 시작... (Ctrl+C로 취소)\n');
    await new Promise(r => setTimeout(r, 5000));
  }

  let success = 0;
  let failed = 0;

  for (const file of jsonFiles) {
    console.log(`\n📄 ${file}`);
    try {
      const recipe: GeneratedRecipe = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf-8'));
      const sql     = buildSQL(recipe);
      const tmpFile = path.join(tmpDir, `${recipe.slug}.sql`);

      runWranglerSQL(sql, tmpFile, isRemote);
      console.log(`  ✅ ${recipe.titleEn} 완료`);
      success++;
    } catch (err) {
      console.error(`  ❌ 실패:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  // 임시 파일 정리
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log(`\n${'─'.repeat(48)}`);
  console.log(`🎉 완료! 성공: ${success} | 실패: ${failed}\n`);
}

seedProd().catch(err => { console.error(err); process.exit(1); });
