import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ─── Categories ───────────────────────────────────────────────────────────────
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),         // e.g. "stews", "rice-dishes"
  nameEn: text('name_en').notNull(),             // "Stews & Soups"
  nameKr: text('name_kr').notNull(),             // "찌개 & 국"
  description: text('description'),
  type: text('type').notNull(),                  // "difficulty" | "region" | "ingredient"
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ─── Ingredients (재료 별도 테이블 – 재사용 가능) ────────────────────────────
export const ingredients = sqliteTable('ingredients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),         // "gochugaru"
  nameKr: text('name_kr').notNull(),             // "고춧가루"
  nameEn: text('name_en').notNull(),             // "Korean red pepper flakes"
  romanization: text('romanization').notNull(),  // "gochugaru"
  description: text('description'),             // 재료 설명 (영어)
  substitute: text('substitute'),               // "red pepper flakes (use 70%)"
  whereToFind: text('where_to_find'),           // "Asian grocery stores, Amazon"
  storageNote: text('storage_note'),            // 보관 방법
  imageUrl: text('image_url'),

  // SEO
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ─── Recipes ──────────────────────────────────────────────────────────────────
export const recipes = sqliteTable('recipes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),         // "kimchi-jjigae"
  categoryId: integer('category_id').references(() => categories.id),

  // 기본 정보
  titleKr: text('title_kr').notNull(),           // "김치찌개"
  titleEn: text('title_en').notNull(),           // "Kimchi Stew"
  romanization: text('romanization').notNull(),  // "Kimchi-jjigae"
  description: text('description').notNull(),    // SEO 영어 설명
  culturalNote: text('cultural_note'),           // 문화적 배경

  // 조리 정보
  difficulty: text('difficulty').notNull(),      // "easy" | "medium" | "hard"
  cookingTime: integer('cooking_time').notNull(),// 분
  servings: integer('servings').notNull(),
  region: text('region'),                        // "Seoul" | "Jeonju" | "Nationwide"

  // 조리 단계 (JSON)
  // [{ step, textEn, koreanExpression, grammarNote }]
  instructions: text('instructions').notNull(),

  // 팁 & 드라마 등장 (JSON)
  tips: text('tips'),                            // string[]
  kDramaAppearances: text('k_drama_appearances'),// [{ drama, episode, note }]

  // SEO
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  keywords: text('keywords'),                    // JSON: string[]

  // 관리
  imageUrl: text('image_url'),
  published: integer('published', { mode: 'boolean' }).default(false),
  aiProvider: text('ai_provider'),               // "claude" | "gemini" | "openai"
  aiModel: text('ai_model'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ─── Recipe ↔ Ingredients (다대다 연결) ───────────────────────────────────────
export const recipeIngredients = sqliteTable('recipe_ingredients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  recipeId: integer('recipe_id').notNull().references(() => recipes.id),
  ingredientId: integer('ingredient_id').notNull().references(() => ingredients.id),
  amount: text('amount').notNull(),              // "2"
  unit: text('unit'),                            // "cups" | "g" | "tbsp" | null
  note: text('note'),                            // "finely chopped"
  orderIndex: integer('order_index').notNull(),  // 재료 나열 순서
});

// ─── Korean Phrases / Vocabulary ──────────────────────────────────────────────
export const koreanPhrases = sqliteTable('korean_phrases', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  recipeId: integer('recipe_id').references(() => recipes.id), // null이면 공통 표현

  // 표현
  phraseKr: text('phrase_kr').notNull(),         // "끓이다"
  phraseEn: text('phrase_en').notNull(),         // "to boil"
  romanization: text('romanization').notNull(),  // "kkeulida"
  partOfSpeech: text('part_of_speech'),          // "verb" | "noun" | "expression"
  level: text('level').notNull(),                // "beginner" | "intermediate" | "advanced"

  // 문법
  grammarPoint: text('grammar_point'),           // "~아/어서", "~기 전에"
  grammarExplanation: text('grammar_explanation'),

  // 예문
  exampleKr: text('example_kr'),
  exampleRomanization: text('example_romanization'),
  exampleEn: text('example_en'),

  // 컨텍스트
  usageNote: text('usage_note'),
  contextType: text('context_type'),            // "cooking" | "restaurant" | "shopping" | "general"
  relatedWords: text('related_words'),          // JSON: string[]

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export const quizzes = sqliteTable('quizzes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  recipeId: integer('recipe_id').references(() => recipes.id),

  type: text('type').notNull(),                  // "multiple_choice" | "fill_blank" | "translation" | "matching"
  difficulty: text('difficulty').notNull(),      // "easy" | "medium" | "hard"
  question: text('question').notNull(),
  options: text('options'),                      // JSON: string[]
  answer: text('answer').notNull(),
  explanation: text('explanation'),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ─── Blog Posts (Culture & K-Drama) ───────────────────────────────────────────
export const blogPosts = sqliteTable('blog_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  content: text('content').notNull(),           // Markdown
  tags: text('tags'),                           // JSON: string[]
  imageUrl: text('image_url'),
  published: integer('published', { mode: 'boolean' }).default(false),
  aiProvider: text('ai_provider'),
  aiModel: text('ai_model'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ─── TypeScript Types ──────────────────────────────────────────────────────────
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Ingredient = typeof ingredients.$inferSelect;
export type NewIngredient = typeof ingredients.$inferInsert;
export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type NewRecipeIngredient = typeof recipeIngredients.$inferInsert;
export type KoreanPhrase = typeof koreanPhrases.$inferSelect;
export type NewKoreanPhrase = typeof koreanPhrases.$inferInsert;
export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
