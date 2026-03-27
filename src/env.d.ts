/// <reference types="@cloudflare/workers-types" />

type D1Database = import('@cloudflare/workers-types').D1Database;

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        DB: D1Database;
        ANTHROPIC_API_KEY?: string;
        GEMINI_API_KEY?: string;
        OPENAI_API_KEY?: string;
        GROQ_API_KEY?: string;
        ADMIN_SECRET?: string;
      };
    };
  }
}
