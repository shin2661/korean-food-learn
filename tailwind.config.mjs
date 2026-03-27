/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // 한국 전통색 기반 팔레트
        korean: {
          red: '#C0392B',       // 고추 빨강
          white: '#F5F5F0',     // 쌀 흰색
          black: '#1A1A1A',     // 간장 검정
          gold: '#D4A017',      // 전통 황금색
          green: '#2D6A4F',     // 깻잎 초록
          beige: '#F0E6D3',     // 한지 베이지
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans KR', 'sans-serif'],
        korean: ['Noto Sans KR', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
