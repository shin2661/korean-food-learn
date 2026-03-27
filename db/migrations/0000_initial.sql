-- ============================================================
-- Migration: 0000_initial.sql
-- Run locally : npm run db:migrate:local
-- Run prod    : npm run db:migrate:prod
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─── categories ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL UNIQUE,
  name_en     TEXT    NOT NULL,
  name_kr     TEXT    NOT NULL,
  description TEXT,
  type        TEXT    NOT NULL,   -- 'difficulty' | 'region' | 'ingredient'
  created_at  INTEGER NOT NULL
);

-- ─── ingredients ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ingredients (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT    NOT NULL UNIQUE,
  name_kr          TEXT    NOT NULL,
  name_en          TEXT    NOT NULL,
  romanization     TEXT    NOT NULL,
  description      TEXT,
  substitute       TEXT,
  where_to_find    TEXT,
  storage_note     TEXT,
  image_url        TEXT,
  meta_title       TEXT,
  meta_description TEXT,
  created_at       INTEGER NOT NULL
);

-- ─── recipes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recipes (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT    NOT NULL UNIQUE,
  category_id      INTEGER REFERENCES categories(id),
  title_kr         TEXT    NOT NULL,
  title_en         TEXT    NOT NULL,
  romanization     TEXT    NOT NULL,
  description      TEXT    NOT NULL,
  cultural_note    TEXT,
  difficulty       TEXT    NOT NULL,   -- 'easy' | 'medium' | 'hard'
  cooking_time     INTEGER NOT NULL,
  servings         INTEGER NOT NULL,
  region           TEXT,
  instructions     TEXT    NOT NULL,   -- JSON
  tips             TEXT,               -- JSON
  k_drama_appearances TEXT,           -- JSON
  meta_title       TEXT,
  meta_description TEXT,
  keywords         TEXT,               -- JSON
  image_url        TEXT,
  published        INTEGER NOT NULL DEFAULT 0,
  ai_provider      TEXT,
  ai_model         TEXT,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);

-- ─── recipe_ingredients ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id     INTEGER NOT NULL REFERENCES recipes(id),
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(id),
  amount        TEXT    NOT NULL,
  unit          TEXT,
  note          TEXT,
  order_index   INTEGER NOT NULL
);

-- ─── korean_phrases ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS korean_phrases (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id            INTEGER REFERENCES recipes(id),
  phrase_kr            TEXT    NOT NULL,
  phrase_en            TEXT    NOT NULL,
  romanization         TEXT    NOT NULL,
  part_of_speech       TEXT,
  level                TEXT    NOT NULL,   -- 'beginner' | 'intermediate' | 'advanced'
  grammar_point        TEXT,
  grammar_explanation  TEXT,
  example_kr           TEXT,
  example_romanization TEXT,
  example_en           TEXT,
  usage_note           TEXT,
  context_type         TEXT,              -- 'cooking' | 'restaurant' | 'shopping' | 'general'
  related_words        TEXT,              -- JSON
  created_at           INTEGER NOT NULL
);

-- ─── quizzes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quizzes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id   INTEGER REFERENCES recipes(id),
  type        TEXT    NOT NULL,   -- 'multiple_choice' | 'fill_blank' | 'translation' | 'matching'
  difficulty  TEXT    NOT NULL,
  question    TEXT    NOT NULL,
  options     TEXT,               -- JSON
  answer      TEXT    NOT NULL,
  explanation TEXT,
  created_at  INTEGER NOT NULL
);

-- ─── blog_posts ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT    NOT NULL UNIQUE,
  title            TEXT    NOT NULL,
  description      TEXT    NOT NULL,
  content          TEXT    NOT NULL,
  tags             TEXT,               -- JSON
  image_url        TEXT,
  published        INTEGER NOT NULL DEFAULT 0,
  ai_provider      TEXT,
  ai_model         TEXT,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);

-- ─── indexes (쿼리 속도 최적화) ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_recipes_published   ON recipes(published);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty  ON recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_category    ON recipes(category_id);
CREATE INDEX IF NOT EXISTS idx_ri_recipe           ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_ri_ingredient       ON recipe_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_phrases_recipe      ON korean_phrases(recipe_id);
CREATE INDEX IF NOT EXISTS idx_phrases_level       ON korean_phrases(level);
CREATE INDEX IF NOT EXISTS idx_quizzes_recipe      ON quizzes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_blog_published      ON blog_posts(published);
