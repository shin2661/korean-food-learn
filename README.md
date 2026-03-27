# 🇰🇷 Korean Food & Language Learning Site

> Learn Korean naturally through authentic recipes.
> Built with Astro + Cloudflare Pages + D1 + AI content pipeline.

---

## 🚀 Quick Start

```bash
# 1. 의존성 설치
npm install

# 2. .env.local 에 API 키 입력
cp .env.local .env.local   # 이미 있음 — 키만 채우기

# 3. 로컬 D1 마이그레이션
npm run db:migrate:local

# 4. 레시피 생성 (AI 선택 → 음식 이름 입력)
npm run generate

# 5. DB에 삽입
npm run db:seed

# 6. 로컬 실행
npm run dev
```

---

## 📁 프로젝트 구조

```
.
├── db/
│   ├── schema.ts               # Drizzle 스키마
│   └── migrations/
│       └── 0000_initial.sql    # D1 테이블 생성 SQL
│
├── scripts/
│   ├── generate.ts             # AI 콘텐츠 생성 CLI
│   ├── seed.ts                 # 로컬 D1 시드
│   ├── seed-prod.ts            # 프로덕션 D1 시드 (Wrangler)
│   ├── output/                 # 생성된 JSON 저장 위치
│   └── ai-clients/
│       ├── claude.ts
│       ├── gemini.ts
│       └── openai.ts
│
└── src/
    ├── layouts/BaseLayout.astro
    ├── components/
    │   ├── DifficultyBadge.astro
    │   ├── PhraseCard.astro
    │   └── QuizSection.astro
    └── pages/
        ├── index.astro               # 홈
        ├── recipes/
        │   ├── index.astro           # 목록 + 필터
        │   └── [slug].astro          # 레시피 상세 (핵심 템플릿)
        ├── learn/index.astro         # 한국어 표현 모음
        ├── ingredients/
        │   ├── index.astro
        │   └── [slug].astro
        ├── quizzes/index.astro
        ├── blog/
        │   ├── index.astro
        │   └── [slug].astro
        ├── about.astro
        ├── privacy.astro             # AdSense 필수
        └── 404.astro
```

---

## ⚙️ 전체 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 로컬 개발 서버 (http://localhost:4321) |
| `npm run build` | 프로덕션 빌드 |
| `npm run deploy` | Cloudflare Pages 배포 |
| `npm run generate` | AI로 레시피 콘텐츠 생성 → scripts/output/*.json |
| `npm run db:migrate:local` | 로컬 D1에 테이블 생성 |
| `npm run db:migrate:prod` | 프로덕션 D1에 테이블 생성 |
| `npm run db:seed` | output/*.json → 로컬 D1 삽입 |
| `npm run db:seed:prod` | output/*.json → 프로덕션 D1 삽입 |

---

## 🔄 콘텐츠 추가 워크플로우

```
1. npm run generate
   → AI Provider/Model 선택
   → 음식 이름 입력 (단건 또는 쉼표 구분 다건)
   → scripts/output/[slug].json 생성

2. (선택) JSON 파일 직접 열어서 내용 검토/수정

3. npm run db:seed         ← 로컬 확인용
   npm run dev             ← http://localhost:4321 에서 확인

4. npm run db:seed:prod    ← 프로덕션 반영
   npm run deploy          ← Cloudflare Pages 배포
```

---

## ☁️ Cloudflare 배포 설정

### 1. D1 데이터베이스 생성

```bash
wrangler d1 create korean-food-db
# → 출력된 database_id 를 wrangler.toml 에 붙여넣기
```

### 2. wrangler.toml 업데이트

```toml
[[d1_databases]]
binding = "DB"
database_name = "korean-food-db"
database_id = "여기에-실제-id-입력"
```

### 3. 프로덕션 마이그레이션 + 배포

```bash
wrangler login
npm run db:migrate:prod
npm run db:seed:prod
npm run deploy
```

### 4. GitHub 연동 (자동 배포)

Cloudflare Pages 대시보드 → Connect to Git → 이 저장소 선택
- Build command: `npm run build`
- Build output: `dist`
- Environment variables: Cloudflare 대시보드에서 D1 바인딩 추가

---

## 💰 AdSense 설정

1. 최소 30개 이상 레시피 생성 후 신청
2. `src/layouts/BaseLayout.astro` `<head>` 안에 AdSense 스크립트 추가:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX" crossorigin="anonymous"></script>
   ```
3. `src/pages/recipes/[slug].astro` 의 `.adsense-slot` 자리에 실제 광고 단위 삽입

---

## 🔑 환경 변수 (.env.local)

```env
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=sk-...
```
