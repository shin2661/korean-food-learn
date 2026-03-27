import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'hybrid',  // 정적 기본 + 필요한 페이지만 SSR (Cloudflare Functions)

  adapter: cloudflare({
    platformProxy: {
      enabled: true,  // 로컬에서 D1, KV 등 Cloudflare 바인딩 사용 가능
    },
  }),

  integrations: [
    tailwind({
      applyBaseStyles: false, // src/styles/global.css에서 직접 관리
    }),
  ],

  // 사이트 URL (도메인 확정 후 변경)
  site: 'https://your-domain.com',

  // 빌드 최적화
  build: {
    inlineStylesheets: 'auto',
  },

  // Markdown 설정 (Blog/Culture 콘텐츠용)
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },

  // 개발 서버
  server: {
    port: 4321,
  },

  // 이미지 최적화
  image: {
    domains: [],  // 외부 이미지 도메인 허용 목록 (추후 추가)
  },

  // Vite 설정
  vite: {
    define: {
      // 환경변수 타입 안전하게 접근
      'import.meta.env.SITE_URL': JSON.stringify(process.env.SITE_URL ?? 'http://localhost:4321'),
    },
  },
});
