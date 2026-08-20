// src/inngest/client.ts
import { Inngest } from "inngest";

/**
 * Inisialisasi Inngest Client standar tanpa skema kaku.
 * Ini mencegah bentrok type checker TypeScript di VS Code.
 */
export const inngest = new Inngest({
  id: "ai-workflow-builder",
});