// src/inngest/workflow.ts
import { inngest } from "./client";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Menggunakan (inngest.createFunction as any) untuk bypass overload TypeScript Inngest SDK
 * yang memblokir penulisan fungsi handler di VS Code.
 */
export const executeWorkflow = (inngest.createFunction as any)(
  { id: "execute-ai-workflow" },
  { event: "workflow/run" },
  async ({ event, step }: { event: any; step: any }) => {
    // Parsing payload data dari event
    const data = event?.data || {};
    const nodes = data?.nodes || [];
    const edges = data?.edges || [];
    const initialInput = data?.initialInput || "";

    if (!nodes.length) {
      return { status: "ERROR", message: "Tidak ada node ditemukan pada kanvas.", logs: [] };
    }

    // Cari node pertama (node yang tidak ditunjuk oleh edge manapun)
    const targetNodeIds = new Set(edges.map((e: any) => e.target));
    const startNode = nodes.find((n: any) => !targetNodeIds.has(n.id)) || nodes[0];

    if (!startNode) {
      return { status: "ERROR", message: "Node awal tidak ditemukan.", logs: [] };
    }

    let currentNodeId: string | null = startNode.id;
    const executionLogs: Array<{ nodeId: string; prompt: string; decision: string }> = [];

    // Loop penjelajahan node berdasarkan keputusan AI
    while (currentNodeId) {
      const currentNode = nodes.find((n: any) => n.id === currentNodeId);
      if (!currentNode) break;

      const nodePrompt = currentNode.data.prompt;
      const stepNodeId = currentNodeId;

      // STEP INNGEST: Panggilan OpenAI secara terisolasi
      const decision: "YES" | "NO" = await step.run(
        `evaluate-node-${stepNodeId}`,
        async () => {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0,
            messages: [
              {
                role: "system",
                content:
                  'Kamu adalah agen penilai keputusan. Evaluasi input pengguna berdasarkan kondisi yang diberikan. Jawab HANYA dengan kata "YES" atau "NO". Dilarang memberikan teks atau penjelasan tambahan.',
              },
              {
                role: "user",
                content: `Data Input: "${initialInput}"\nKondisi Evaluasi: "${nodePrompt}"`,
              },
            ],
          });

          const resultText = response.choices[0]?.message?.content?.trim().toUpperCase();
          return resultText === "YES" ? "YES" : "NO";
        }
      );

      // Simpan catatan hasil eksekusi
      executionLogs.push({
        nodeId: stepNodeId,
        prompt: nodePrompt,
        decision,
      });

      // Cari garis keluar (edge) yang sesuai ("yes" atau "no")
      const matchingEdge = edges.find(
        (e: any) => e.source === stepNodeId && e.sourceHandle === decision.toLowerCase()
      );

      // Pindah ke node berikutnya
      currentNodeId = matchingEdge ? matchingEdge.target : null;
    }

    return {
      status: "COMPLETED",
      initialInput,
      logs: executionLogs,
    };
  }
);