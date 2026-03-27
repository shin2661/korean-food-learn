/**
 * mock.ts
 * -------
 * AI API 없이 로컬 테스트용 mock 데이터를 scripts/output/ 에 생성합니다.
 *
 * 사용법:
 *   npm run mock
 */

import * as fs from 'fs';
import * as path from 'path';

const outputDir = path.join(process.cwd(), 'scripts', 'output');
fs.mkdirSync(outputDir, { recursive: true });

// ─── Mock 레시피 데이터 ────────────────────────────────────────────────────────

const mockRecipes = [

  // ── 1. 김치찌개 ──────────────────────────────────────────────────────────────
  {
    slug: 'kimchi-jjigae',
    titleKr: '김치찌개',
    titleEn: 'Kimchi Stew',
    romanization: 'Kimchi-jjigae',
    description: 'Kimchi jjigae is Korea\'s most beloved comfort food — a hearty, spicy stew made with well-fermented kimchi, pork, and tofu. Rich in umami and packed with heat, it\'s the dish Koreans crave most on cold days.',
    culturalNote: 'Kimchi jjigae is so embedded in Korean culture that it\'s sometimes called the "national stew." Most Korean households have a slightly different family recipe, and aged kimchi (묵은지) is considered the secret to the best flavor.',
    difficulty: 'easy',
    cookingTime: 30,
    servings: 4,
    region: 'Nationwide',
    instructions: [
      { step: 1, textEn: 'Cut pork belly into bite-sized pieces and sauté in a pot over medium-high heat until slightly browned.', koreanExpression: '볶다 (bokda) — to stir-fry/sauté', grammarNote: '중불 (jungbul) = medium heat' },
      { step: 2, textEn: 'Add kimchi and stir-fry together with the pork for 3 minutes.', koreanExpression: '함께 볶아요 — stir-fry together', grammarNote: '~아/어요 = polite present tense' },
      { step: 3, textEn: 'Pour in water or anchovy stock and bring to a boil.', koreanExpression: '끓이다 (kkeulida) — to boil', grammarNote: null },
      { step: 4, textEn: 'Add gochugaru, gochujang, soy sauce, and garlic. Simmer for 15 minutes.', koreanExpression: '졸이다 (jolida) — to simmer/reduce', grammarNote: '~아/어서 = and then / because' },
      { step: 5, textEn: 'Add tofu cut into cubes and simmer for 5 more minutes. Season to taste.', koreanExpression: '간을 맞추다 — to season / adjust the taste', grammarNote: null },
    ],
    tips: [
      'Use well-aged kimchi (묵은지) for a deeper, richer flavor.',
      'Add a small amount of gochujang for color and sweetness.',
      'Serve with a bowl of steamed white rice — always.',
    ],
    kDramaAppearances: [
      { drama: 'Reply 1988 (응답하라 1988)', episode: 'Multiple episodes', note: 'The neighborhood families share kimchi jjigae together, symbolizing community and warmth.' },
      { drama: 'Crash Landing on You (사랑의 불시착)', episode: 'Episode 7', note: 'A North Korean soldier tastes kimchi jjigae for the first time in the South, highlighting its cultural significance.' },
    ],
    metaTitle: 'Kimchi Jjigae (김치찌개) Recipe | Learn Korean Through Cooking',
    metaDescription: 'Make authentic Korean kimchi stew and learn 10 Korean cooking phrases. Step-by-step recipe with vocabulary, grammar tips, and a quiz.',
    keywords: ['kimchi jjigae recipe', 'korean kimchi stew', 'learn korean through food', '김치찌개'],
    ingredients: [
      { slug: 'kimchi', nameKr: '김치', nameEn: 'Kimchi', romanization: 'kimchi', description: 'Fermented spicy napa cabbage. The older and more sour, the better for jjigae.', substitute: 'Store-bought kimchi works fine; avoid fresh kimchi for this dish.', whereToFind: 'Korean grocery stores (H-Mart, Hana), most Asian supermarkets', storageNote: 'Refrigerate in airtight container. Lasts months.', amount: '2', unit: 'cups', note: 'Aged (묵은지) preferred', orderIndex: 1 },
      { slug: 'pork-belly', nameKr: '삼겹살', nameEn: 'Pork Belly', romanization: 'samgyeopsal', description: 'Fatty pork belly slices, the most popular cut for Korean cooking.', substitute: 'Pork shoulder or uncured bacon', whereToFind: 'Any butcher or supermarket', storageNote: 'Freeze if not using within 2 days', amount: '200', unit: 'g', note: 'Cut into bite-sized pieces', orderIndex: 2 },
      { slug: 'tofu', nameKr: '두부', nameEn: 'Tofu', romanization: 'dubu', description: 'Soft or firm tofu absorbs the stew\'s flavor beautifully.', substitute: 'Skip if unavailable, or use silken tofu', whereToFind: 'Any supermarket', storageNote: 'Store in water in the fridge, change water daily', amount: '1', unit: 'block', note: 'Soft or medium firm', orderIndex: 3 },
      { slug: 'gochugaru', nameKr: '고춧가루', nameEn: 'Korean Red Pepper Flakes', romanization: 'gochugaru', description: 'Coarsely ground Korean chili pepper. Bright red, mildly smoky, essential for Korean cooking.', substitute: 'Red pepper flakes (use 60% of amount — they\'re hotter)', whereToFind: 'Korean grocery stores, Amazon', storageNote: 'Keep in freezer to preserve color and flavor', amount: '2', unit: 'tbsp', note: null, orderIndex: 4 },
      { slug: 'gochujang', nameKr: '고추장', nameEn: 'Korean Chili Paste', romanization: 'gochujang', description: 'Fermented chili paste with sweet, savory, and spicy notes.', substitute: 'Sriracha mixed with a touch of miso (not identical but works)', whereToFind: 'Korean grocery stores, most Asian supermarkets', storageNote: 'Refrigerate after opening, lasts 1 year', amount: '1', unit: 'tbsp', note: null, orderIndex: 5 },
      { slug: 'garlic', nameKr: '마늘', nameEn: 'Garlic', romanization: 'maneul', description: 'Minced garlic is used in nearly every Korean dish.', substitute: 'Garlic powder (use sparingly)', whereToFind: 'Any supermarket', storageNote: 'Room temperature up to 1 month', amount: '4', unit: 'cloves', note: 'Minced', orderIndex: 6 },
      { slug: 'soy-sauce', nameKr: '간장', nameEn: 'Soy Sauce', romanization: 'ganjang', description: 'Korean soy sauce (국간장 or 진간장) for seasoning.', substitute: 'Japanese soy sauce works fine', whereToFind: 'Any supermarket', storageNote: 'Room temperature, indefinite shelf life', amount: '1', unit: 'tbsp', note: null, orderIndex: 7 },
      { slug: 'green-onion', nameKr: '파', nameEn: 'Green Onion', romanization: 'pa', description: 'Used as a finishing garnish and aromatic in Korean cooking.', substitute: 'Chives', whereToFind: 'Any supermarket', storageNote: 'Wrap in damp paper towel, fridge 1 week', amount: '2', unit: 'stalks', note: 'Sliced diagonally', orderIndex: 8 },
    ],
    phrases: [
      { phraseKr: '끓이다', phraseEn: 'to boil', romanization: 'kkeulida', partOfSpeech: 'verb', level: 'beginner', grammarPoint: '~아/어 주세요', grammarExplanation: 'Polite request: "Please boil..." → 끓여 주세요', exampleKr: '물을 끓여 주세요', exampleRomanization: 'mureul kkeullyeo juseyo', exampleEn: 'Please boil the water', usageNote: 'Used in cooking instructions and restaurants', contextType: 'cooking' },
      { phraseKr: '볶다', phraseEn: 'to stir-fry / sauté', romanization: 'bokda', partOfSpeech: 'verb', level: 'beginner', grammarPoint: null, grammarExplanation: null, exampleKr: '고기를 볶아요', exampleRomanization: 'gogireul bokayo', exampleEn: 'I stir-fry the meat', usageNote: 'One of the most common Korean cooking verbs', contextType: 'cooking' },
      { phraseKr: '중불', phraseEn: 'medium heat', romanization: 'jungbul', partOfSpeech: 'noun', level: 'beginner', grammarPoint: null, grammarExplanation: null, exampleKr: '중불로 줄여주세요', exampleRomanization: 'jungbullo juryeo juseyo', exampleEn: 'Please reduce to medium heat', usageNote: '약불 = low heat, 강불 = high heat', contextType: 'cooking' },
      { phraseKr: '간을 맞추다', phraseEn: 'to season / adjust the taste', romanization: 'ganeul matchuda', partOfSpeech: 'expression', level: 'intermediate', grammarPoint: '~을/를', grammarExplanation: 'Object particle: 간 (seasoning/taste) + 을 + 맞추다 (to adjust)', exampleKr: '간을 맞춰 보세요', exampleRomanization: 'ganeul matchwo boseyo', exampleEn: 'Try adjusting the seasoning', usageNote: 'Said when tasting food during cooking', contextType: 'cooking' },
      { phraseKr: '잘 먹겠습니다', phraseEn: 'I will eat well (said before a meal)', romanization: 'jal meokgesseumnida', partOfSpeech: 'expression', level: 'beginner', grammarPoint: '~겠~', grammarExplanation: 'Expresses intention or future action (겠 = will/shall)', exampleKr: '잘 먹겠습니다!', exampleRomanization: 'jal meokgesseumnida!', exampleEn: 'I will eat well! (thank you for the food)', usageNote: 'Always said before eating in Korean culture', contextType: 'general' },
      { phraseKr: '맵다', phraseEn: 'spicy / hot', romanization: 'maepda', partOfSpeech: 'adjective', level: 'beginner', grammarPoint: '너무 ~다', grammarExplanation: '너무 = too much: 너무 매워요 = It\'s too spicy', exampleKr: '이거 너무 매워요!', exampleRomanization: 'igeo neomu maewoyo!', exampleEn: 'This is too spicy!', usageNote: 'Very useful at Korean restaurants', contextType: 'restaurant' },
      { phraseKr: '묵은지', phraseEn: 'aged kimchi', romanization: 'mugeun-ji', partOfSpeech: 'noun', level: 'intermediate', grammarPoint: null, grammarExplanation: null, exampleKr: '묵은지로 만든 김치찌개', exampleRomanization: 'mugeunji ro mandeun kimchijjigae', exampleEn: 'Kimchi stew made with aged kimchi', usageNote: 'Kimchi fermented for over 6 months — prized for cooking', contextType: 'cooking' },
      { phraseKr: '얼큰하다', phraseEn: 'to be spicy and clear (of a broth)', romanization: 'eolkeunhada', partOfSpeech: 'adjective', level: 'advanced', grammarPoint: null, grammarExplanation: null, exampleKr: '얼큰한 국물이 맛있어요', exampleRomanization: 'eolkeunan gungmuri massisseoyo', exampleEn: 'The spicy broth is delicious', usageNote: 'Describes the specific flavor of a clear spicy Korean broth', contextType: 'restaurant' },
    ],
    quizzes: [
      { type: 'multiple_choice', difficulty: 'easy', question: 'What does 김치찌개 (kimchi jjigae) mean?', options: ['Kimchi Stew', 'Kimchi Fried Rice', 'Spicy Noodles', 'Kimchi Pancake'], answer: 'Kimchi Stew', explanation: '찌개 (jjigae) means stew or hot pot in Korean. 김치찌개 = kimchi stew.' },
      { type: 'multiple_choice', difficulty: 'easy', question: 'Which verb means "to boil" in Korean?', options: ['볶다', '끓이다', '굽다', '튀기다'], answer: '끓이다', explanation: '끓이다 (kkeulida) = to boil. 볶다 = to stir-fry, 굽다 = to grill, 튀기다 = to deep-fry.' },
      { type: 'translation', difficulty: 'medium', question: 'Translate: 중불로 줄여주세요', answer: 'Please reduce to medium heat', explanation: '중불 = medium heat, 줄이다 = to reduce, ~아/어 주세요 = please do (polite request).' },
      { type: 'fill_blank', difficulty: 'medium', question: 'Before eating in Korea, you say: ___ 먹겠습니다', answer: '잘', explanation: '잘 먹겠습니다 — literally "I will eat well" — is the polite expression said before every meal.' },
      { type: 'multiple_choice', difficulty: 'hard', question: 'What is 묵은지?', options: ['Fresh kimchi', 'Aged kimchi (6+ months)', 'Kimchi soup', 'Spicy cabbage salad'], answer: 'Aged kimchi (6+ months)', explanation: '묵은 (mugeun) means old/aged, 지 is short for 김치. Aged kimchi has a deeper, more sour flavor perfect for cooking.' },
    ],
    aiProvider: 'mock',
    aiModel: 'mock-data',
    generatedAt: new Date().toISOString(),
  },

  // ── 2. 비빔밥 ────────────────────────────────────────────────────────────────
  {
    slug: 'bibimbap',
    titleKr: '비빔밥',
    titleEn: 'Mixed Rice Bowl',
    romanization: 'Bibimbap',
    description: 'Bibimbap is a colorful Korean rice bowl topped with seasoned vegetables, a fried egg, and gochujang. The name literally means "mixed rice" — everything gets stirred together just before eating.',
    culturalNote: 'Bibimbap from Jeonju (전주비빔밥) is considered the original and most prestigious version. It\'s said to have originated as a way to use up leftover food on New Year\'s Eve, mixing everything into one bowl.',
    difficulty: 'easy',
    cookingTime: 40,
    servings: 2,
    region: 'Jeonju',
    instructions: [
      { step: 1, textEn: 'Cook rice and keep warm.', koreanExpression: '밥을 짓다 — to cook rice', grammarNote: '짓다 is the special verb used only for cooking rice' },
      { step: 2, textEn: 'Blanch spinach, squeeze dry, and season with sesame oil, garlic, and salt.', koreanExpression: '무치다 (muchida) — to season and mix vegetables', grammarNote: null },
      { step: 3, textEn: 'Sauté bean sprouts, carrots, and zucchini separately, each with a pinch of salt.', koreanExpression: '따로따로 — separately / each one', grammarNote: '따로 = separately, repeated for emphasis' },
      { step: 4, textEn: 'Cook a sunny-side-up egg in a lightly oiled pan.', koreanExpression: '달걀 프라이 — fried egg', grammarNote: null },
      { step: 5, textEn: 'Arrange rice in a bowl, place vegetables and egg on top. Add gochujang and mix everything together.', koreanExpression: '비비다 (bibida) — to mix by stirring', grammarNote: '비빔밥 literally means "mixed (비빔) rice (밥)"' },
    ],
    tips: [
      'Warm your bowl before serving (dolsot bibimbap uses a hot stone bowl).',
      'The key is to season each vegetable separately before assembling.',
      'Mix vigorously with a spoon — the more you mix, the better it tastes.',
    ],
    kDramaAppearances: [
      { drama: 'Jewel in the Palace (대장금)', episode: 'Episode 3', note: 'The royal court version of bibimbap is prepared with elaborate toppings, showcasing traditional Korean court cuisine.' },
    ],
    metaTitle: 'Bibimbap (비빔밥) Recipe | Korean Mixed Rice Bowl',
    metaDescription: 'Make authentic Korean bibimbap at home and learn the Korean words for vegetables, cooking actions, and table expressions.',
    keywords: ['bibimbap recipe', 'korean mixed rice bowl', 'learn korean food vocabulary', '비빔밥'],
    ingredients: [
      { slug: 'short-grain-rice', nameKr: '쌀', nameEn: 'Short-grain White Rice', romanization: 'ssal', description: 'Korean/Japanese short-grain rice is stickier than long-grain.', substitute: 'Sushi rice or medium-grain rice', whereToFind: 'Asian supermarkets, most grocery stores', storageNote: 'Cool dry place up to 1 year', amount: '2', unit: 'cups', note: 'Cooked', orderIndex: 1 },
      { slug: 'spinach', nameKr: '시금치', nameEn: 'Spinach', romanization: 'sigeumchi', description: 'Blanched and seasoned spinach is a bibimbap essential.', substitute: 'Watercress or arugula', whereToFind: 'Any supermarket', storageNote: 'Fridge, 3–5 days', amount: '100', unit: 'g', note: 'Blanched and squeezed dry', orderIndex: 2 },
      { slug: 'bean-sprouts', nameKr: '콩나물', nameEn: 'Bean Sprouts', romanization: 'kongnamul', description: 'Crunchy and nutritious, a classic bibimbap topping.', substitute: 'Mung bean sprouts', whereToFind: 'Asian grocery stores, most supermarkets', storageNote: 'Fridge in water, 3 days', amount: '100', unit: 'g', note: null, orderIndex: 3 },
      { slug: 'carrot', nameKr: '당근', nameEn: 'Carrot', romanization: 'danggeun', description: 'Julienned carrot adds color and sweetness.', substitute: null, whereToFind: 'Any supermarket', storageNote: 'Fridge up to 2 weeks', amount: '1', unit: 'piece', note: 'Julienned', orderIndex: 4 },
      { slug: 'zucchini', nameKr: '애호박', nameEn: 'Zucchini', romanization: 'aehobak', description: 'Korean zucchini is lighter in color and milder than Western zucchini.', substitute: 'Regular zucchini', whereToFind: 'Asian supermarkets or any supermarket', storageNote: 'Fridge, 1 week', amount: '1', unit: 'piece', note: 'Julienned', orderIndex: 5 },
      { slug: 'egg', nameKr: '달걀', nameEn: 'Egg', romanization: 'dalgyal', description: 'A sunny-side-up egg with a runny yolk is traditional.', substitute: null, whereToFind: 'Any supermarket', storageNote: 'Fridge up to 3 weeks', amount: '2', unit: '', note: 'Sunny side up', orderIndex: 6 },
      { slug: 'gochujang', nameKr: '고추장', nameEn: 'Korean Chili Paste', romanization: 'gochujang', description: 'Fermented chili paste — the signature sauce of bibimbap.', substitute: 'Sriracha mixed with miso', whereToFind: 'Korean grocery stores', storageNote: 'Refrigerate after opening', amount: '2', unit: 'tbsp', note: 'Or to taste', orderIndex: 7 },
      { slug: 'sesame-oil', nameKr: '참기름', nameEn: 'Sesame Oil', romanization: 'chamgireum', description: 'Toasted sesame oil gives bibimbap its signature nutty aroma.', substitute: 'Omit if unavailable (flavor will differ)', whereToFind: 'Asian supermarkets, most grocery stores', storageNote: 'Cool dark place, 6 months', amount: '1', unit: 'tbsp', note: null, orderIndex: 8 },
    ],
    phrases: [
      { phraseKr: '비비다', phraseEn: 'to mix by stirring', romanization: 'bibida', partOfSpeech: 'verb', level: 'beginner', grammarPoint: null, grammarExplanation: null, exampleKr: '다 같이 비벼요!', exampleRomanization: 'da gachi bibyeoyo!', exampleEn: 'Let\'s mix it all together!', usageNote: 'This verb is the origin of the word 비빔밥', contextType: 'cooking' },
      { phraseKr: '무치다', phraseEn: 'to season and mix vegetables', romanization: 'muchida', partOfSpeech: 'verb', level: 'intermediate', grammarPoint: null, grammarExplanation: null, exampleKr: '시금치를 무쳐요', exampleRomanization: 'sigeumchireul mucheoyo', exampleEn: 'I season the spinach', usageNote: 'Used specifically for tossing vegetables with seasoning', contextType: 'cooking' },
      { phraseKr: '맛있다', phraseEn: 'delicious / tastes good', romanization: 'masitda', partOfSpeech: 'adjective', level: 'beginner', grammarPoint: '~다 / ~어요', grammarExplanation: 'Dictionary form: 맛있다. Polite form: 맛있어요', exampleKr: '와, 진짜 맛있어요!', exampleRomanization: 'wa, jinjja masisseoyo!', exampleEn: 'Wow, it\'s really delicious!', usageNote: 'The most useful word at any Korean meal', contextType: 'general' },
      { phraseKr: '따로따로', phraseEn: 'separately / each one', romanization: 'ttarottaro', partOfSpeech: 'adverb', level: 'intermediate', grammarPoint: null, grammarExplanation: null, exampleKr: '야채를 따로따로 볶아요', exampleRomanization: 'yaechaereul ttarottaro bokayo', exampleEn: 'Stir-fry the vegetables separately', usageNote: 'Repeated form of 따로 for emphasis — common in recipes', contextType: 'cooking' },
      { phraseKr: '간장', phraseEn: 'soy sauce', romanization: 'ganjang', partOfSpeech: 'noun', level: 'beginner', grammarPoint: null, grammarExplanation: null, exampleKr: '간장 조금 넣어주세요', exampleRomanization: 'ganjang jogeum neoeo juseyo', exampleEn: 'Please add a little soy sauce', usageNote: '국간장 = soup soy sauce (lighter), 진간장 = regular soy sauce', contextType: 'cooking' },
      { phraseKr: '조금', phraseEn: 'a little / a bit', romanization: 'jogeum', partOfSpeech: 'adverb', level: 'beginner', grammarPoint: null, grammarExplanation: null, exampleKr: '소금 조금만요', exampleRomanization: 'sogeum jogeummanyo', exampleEn: 'Just a little salt please', usageNote: '조금만 = just a little (more polite/soft)', contextType: 'restaurant' },
    ],
    quizzes: [
      { type: 'multiple_choice', difficulty: 'easy', question: 'What does 비빔밥 (bibimbap) literally mean?', options: ['Spicy rice', 'Mixed rice', 'Colorful bowl', 'Royal rice'], answer: 'Mixed rice', explanation: '비빔 comes from 비비다 (to mix by stirring), and 밥 means rice/meal. So 비빔밥 = mixed rice.' },
      { type: 'translation', difficulty: 'easy', question: 'How do you say "delicious" in Korean?', answer: '맛있어요', explanation: '맛있다 is the adjective "delicious." In polite speech, it becomes 맛있어요. You\'ll use this every meal in Korea!' },
      { type: 'multiple_choice', difficulty: 'medium', question: 'What does 무치다 mean in the context of cooking?', options: ['To boil', 'To deep-fry', 'To season and mix vegetables', 'To steam'], answer: 'To season and mix vegetables', explanation: '무치다 is specifically used when tossing vegetables with seasoning like sesame oil, garlic, and salt.' },
      { type: 'fill_blank', difficulty: 'medium', question: 'Complete: 야채를 ___ 볶아요 (stir-fry the vegetables separately)', answer: '따로따로', explanation: '따로따로 means "separately/each one." It\'s a repeated form of 따로 used for emphasis in Korean.' },
      { type: 'translation', difficulty: 'hard', question: 'Translate: 다 같이 비벼요', answer: 'Let\'s mix it all together', explanation: '다 = all, 같이 = together, 비벼요 = present tense of 비비다 (to mix). A great expression to use when serving bibimbap!' },
    ],
    aiProvider: 'mock',
    aiModel: 'mock-data',
    generatedAt: new Date().toISOString(),
  },

  // ── 3. 불고기 ────────────────────────────────────────────────────────────────
  {
    slug: 'bulgogi',
    titleKr: '불고기',
    titleEn: 'Korean Grilled Beef',
    romanization: 'Bulgogi',
    description: 'Bulgogi is thinly sliced, marinated beef that is grilled or pan-cooked until caramelized and tender. The sweet-savory marinade made with soy sauce, pear, and sesame is one of the most iconic flavors in Korean cuisine.',
    culturalNote: 'Bulgogi (불고기) literally means "fire meat" — 불 (bul) = fire, 고기 (gogi) = meat. It\'s one of the most recognized Korean dishes internationally and has been eaten since the Goguryeo era (37 BC–668 AD).',
    difficulty: 'easy',
    cookingTime: 25,
    servings: 4,
    region: 'Nationwide',
    instructions: [
      { step: 1, textEn: 'Mix soy sauce, sugar, pear juice, sesame oil, garlic, and ginger in a bowl to make the marinade.', koreanExpression: '양념을 만들다 — to make the marinade/seasoning', grammarNote: '양념 (yangnyeom) = seasoning/marinade — a key word in Korean cooking' },
      { step: 2, textEn: 'Add thinly sliced beef and marinate for at least 30 minutes (overnight is best).', koreanExpression: '재우다 (jaeuda) — to marinate', grammarNote: '~을/를 재워요 = marinate something' },
      { step: 3, textEn: 'Heat a pan or grill over high heat. Cook the beef in small batches.', koreanExpression: '강불 (gangbul) — high heat', grammarNote: '강 = strong, 불 = fire/heat' },
      { step: 4, textEn: 'Cook until caramelized and slightly charred at the edges, about 2-3 minutes per side.', koreanExpression: '노릇노릇하다 — to be golden-brown', grammarNote: 'Repeated syllable form (노릇노릇) indicates the color is all over' },
    ],
    tips: [
      'Asian pear or kiwi in the marinade acts as a natural meat tenderizer.',
      'Freeze the beef for 30 minutes before slicing — it\'s much easier to cut thinly.',
      'Don\'t overcrowd the pan or the beef will steam instead of sear.',
    ],
    kDramaAppearances: [
      { drama: 'Itaewon Class (이태원 클라쓰)', episode: 'Episode 1', note: 'Bulgogi is one of the signature dishes at the protagonist\'s pojangmacha (street food stall), central to the show\'s theme of Korean food identity.' },
    ],
    metaTitle: 'Bulgogi (불고기) Recipe | Korean Grilled Beef',
    metaDescription: 'Learn to make authentic Korean bulgogi and pick up Korean fire, meat, and cooking vocabulary with a built-in quiz.',
    keywords: ['bulgogi recipe', 'korean grilled beef', 'how to make bulgogi', '불고기 만들기'],
    ingredients: [
      { slug: 'beef-ribeye', nameKr: '소고기 (ribeye)', nameEn: 'Beef Ribeye', romanization: 'sogogi', description: 'Thinly sliced ribeye or sirloin is best for bulgogi.', substitute: 'Beef sirloin, or any tender cut sliced very thin', whereToFind: 'Korean grocery stores often sell pre-sliced bulgogi cuts', storageNote: 'Use within 2 days or freeze', amount: '500', unit: 'g', note: 'Thinly sliced (2–3mm)', orderIndex: 1 },
      { slug: 'asian-pear', nameKr: '배', nameEn: 'Asian Pear', romanization: 'bae', description: 'Asian pear juice tenderizes the meat and adds natural sweetness.', substitute: 'Kiwi (1/4 kiwi) or grated apple', whereToFind: 'Asian grocery stores, some supermarkets', storageNote: 'Room temperature 1 week, fridge 2–3 weeks', amount: '1/4', unit: 'piece', note: 'Grated or juiced', orderIndex: 2 },
      { slug: 'soy-sauce', nameKr: '간장', nameEn: 'Soy Sauce', romanization: 'ganjang', description: 'Base of the bulgogi marinade.', substitute: 'Tamari for gluten-free', whereToFind: 'Any supermarket', storageNote: 'Room temperature', amount: '4', unit: 'tbsp', note: null, orderIndex: 3 },
      { slug: 'sesame-oil', nameKr: '참기름', nameEn: 'Sesame Oil', romanization: 'chamgireum', description: 'Adds a distinctive nutty fragrance to the marinade.', substitute: 'Omit (flavor will differ significantly)', whereToFind: 'Asian supermarkets', storageNote: 'Cool dark place', amount: '1', unit: 'tbsp', note: null, orderIndex: 4 },
      { slug: 'garlic', nameKr: '마늘', nameEn: 'Garlic', romanization: 'maneul', description: 'Essential aromatic in Korean cooking.', substitute: 'Garlic powder', whereToFind: 'Any supermarket', storageNote: 'Room temperature 1 month', amount: '5', unit: 'cloves', note: 'Minced', orderIndex: 5 },
      { slug: 'sugar', nameKr: '설탕', nameEn: 'Sugar', romanization: 'seoltang', description: 'Balances the salty soy sauce and helps caramelization.', substitute: 'Honey or brown sugar', whereToFind: 'Any supermarket', storageNote: 'Indefinite shelf life', amount: '2', unit: 'tbsp', note: null, orderIndex: 6 },
      { slug: 'green-onion', nameKr: '파', nameEn: 'Green Onion', romanization: 'pa', description: 'Adds freshness to the marinade and as a garnish.', substitute: 'Chives', whereToFind: 'Any supermarket', storageNote: 'Fridge 1 week', amount: '3', unit: 'stalks', note: 'Sliced', orderIndex: 7 },
    ],
    phrases: [
      { phraseKr: '불', phraseEn: 'fire / flame', romanization: 'bul', partOfSpeech: 'noun', level: 'beginner', grammarPoint: null, grammarExplanation: null, exampleKr: '불을 켜다 / 불을 끄다', exampleRomanization: 'bureul kyeoda / bureul kkeuda', exampleEn: 'to turn on / turn off the fire', usageNote: '불고기 = fire (불) + meat (고기). Also in 불닭 (fire chicken)', contextType: 'cooking' },
      { phraseKr: '고기', phraseEn: 'meat', romanization: 'gogi', partOfSpeech: 'noun', level: 'beginner', grammarPoint: null, grammarExplanation: null, exampleKr: '소고기, 돼지고기, 닭고기', exampleRomanization: 'sogogi, dwaejigogi, dakgogi', exampleEn: 'beef, pork, chicken', usageNote: '소 = cow, 돼지 = pig, 닭 = chicken — add 고기 to make the meat word', contextType: 'cooking' },
      { phraseKr: '양념', phraseEn: 'marinade / seasoning', romanization: 'yangnyeom', partOfSpeech: 'noun', level: 'intermediate', grammarPoint: '~으로 양념하다', grammarExplanation: 'To season with something: 간장으로 양념하다 = season with soy sauce', exampleKr: '양념에 재워두세요', exampleRomanization: 'yangnyeome jaewodoseyo', exampleEn: 'Leave it to marinate in the seasoning', usageNote: 'Used for both dry seasonings and wet marinades', contextType: 'cooking' },
      { phraseKr: '재우다', phraseEn: 'to marinate', romanization: 'jaeuda', partOfSpeech: 'verb', level: 'intermediate', grammarPoint: '~에 재워두다', grammarExplanation: 'Leave to marinate: 양념에 재워두다 = leave marinating in seasoning', exampleKr: '하루 동안 재워두세요', exampleRomanization: 'haru dongan jaewodoseyo', exampleEn: 'Leave it marinating for a day', usageNote: 'Also used for letting children sleep (재우다) — same verb, different context!', contextType: 'cooking' },
      { phraseKr: '노릇노릇하다', phraseEn: 'to be golden-brown (nicely cooked)', romanization: 'noreutnoreutada', partOfSpeech: 'adjective', level: 'advanced', grammarPoint: null, grammarExplanation: null, exampleKr: '노릇노릇하게 구워주세요', exampleRomanization: 'noreutnoreutage guweo juseyo', exampleEn: 'Please grill it until golden-brown', usageNote: 'The repeated form emphasizes the color is even all over — sounds beautiful in Korean', contextType: 'cooking' },
      { phraseKr: '맛집', phraseEn: 'a restaurant famous for great food', romanization: 'matjip', partOfSpeech: 'noun', level: 'intermediate', grammarPoint: null, grammarExplanation: null, exampleKr: '여기 불고기 맛집이에요!', exampleRomanization: 'yeogi bulgogi matjibeyo!', exampleEn: 'This place is famous for its bulgogi!', usageNote: '맛 (taste) + 집 (house/place) = a place with great taste. One of the most used words in Korean food culture.', contextType: 'restaurant' },
    ],
    quizzes: [
      { type: 'multiple_choice', difficulty: 'easy', question: 'What does 불고기 (bulgogi) literally mean?', options: ['Fire meat', 'Grilled beef', 'Sweet beef', 'Korean BBQ'], answer: 'Fire meat', explanation: '불 (bul) = fire, 고기 (gogi) = meat. So 불고기 literally means "fire meat" — referring to the grilling method.' },
      { type: 'multiple_choice', difficulty: 'easy', question: 'Which of these means "beef" in Korean?', options: ['닭고기', '돼지고기', '소고기', '양고기'], answer: '소고기', explanation: '소 = cow, 고기 = meat. 소고기 = beef. 닭고기 = chicken, 돼지고기 = pork, 양고기 = lamb.' },
      { type: 'translation', difficulty: 'medium', question: 'Translate: 양념에 재워두세요', answer: 'Leave it to marinate in the seasoning', explanation: '양념 = marinade/seasoning, 에 = in (location particle), 재워두세요 = please leave it marinating (재우다 = to marinate).' },
      { type: 'fill_blank', difficulty: 'medium', question: 'A restaurant famous for great food is called a ___', answer: '맛집', explanation: '맛집 (matjip) = 맛 (taste) + 집 (house/place). It\'s one of the most common words in Korean food culture.' },
      { type: 'multiple_choice', difficulty: 'hard', question: 'What is the purpose of Asian pear in bulgogi marinade?', options: ['Adds sweetness only', 'Tenderizes the meat', 'Adds spiciness', 'Thickens the sauce'], answer: 'Tenderizes the meat', explanation: 'Asian pear (배, bae) contains natural enzymes that break down meat proteins, making bulgogi incredibly tender. Kiwi works similarly.' },
    ],
    aiProvider: 'mock',
    aiModel: 'mock-data',
    generatedAt: new Date().toISOString(),
  },

];

// ─── 파일 저장 ─────────────────────────────────────────────────────────────────

let count = 0;
for (const recipe of mockRecipes) {
  const filePath = path.join(outputDir, `${recipe.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(recipe, null, 2), 'utf-8');
  console.log(`✅ ${recipe.titleEn} (${recipe.titleKr}) → ${recipe.slug}.json`);
  count++;
}

console.log(`\n🎉 Mock 데이터 ${count}개 생성 완료!`);
console.log(`   📁 scripts/output/ 에 저장됐어요`);
console.log(`\n다음 단계:`);
console.log(`   npm run db:migrate:local   ← 테이블 생성 (처음 한 번만)`);
console.log(`   npm run db:seed            ← DB에 삽입`);
console.log(`   npm run dev                ← 사이트 확인\n`);
