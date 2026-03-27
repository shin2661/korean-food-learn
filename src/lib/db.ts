import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@db/schema';

// Astro의 Cloudflare 런타임 환경에서 D1 인스턴스를 가져오는 헬퍼
export function getDB(locals: App.Locals) {
  return drizzle(locals.runtime.env.DB, { schema });
}

// 타입 편의 export
export { schema };
