// src/inngest/workflow.ts
// @ts-nocheck
import { inngest } from "./client";
import Groq from "groq-sdk";

export const executeWorkflow = (inngest.createFunction as any)(
  {
    id: "execute-ai-workflow",
    triggers: [{ event: "workflow/run" }],
  },
  async ({ event, step }: { event: any; step: any }) => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        status: "ERROR",
        message: "GROQ_API_KEY tidak ditemukan di environment file (.env.local).",
        logs: [],
      };
    }

    const groq = new Groq({ apiKey });

    // Deteksi Model Otomatis
    let selectedModel = "";
    try {
      const modelsList = await groq.models.list();
      const activeModels = modelsList.data.map((m: any) => m.id);

      const preferredModels = [
        "qwen/qwen3.6-27b",
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "groq/compound-mini",
        "groq/compound",
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
      ];

      selectedModel = preferredModels.find((m) => activeModels.includes(m)) || "";

      if (!selectedModel) {
        selectedModel =
          activeModels.find(
            (id: string) =>
              !id.includes("whisper") &&
              !id.includes("guard") &&
              !id.includes("orpheus")
          ) || "";
      }

      if (!selectedModel) {
        return {
          status: "ERROR",
          message: `Tidak ditemukan model chat yang aktif.`,
          logs: [],
        };
      }
    } catch (err: any) {
      return {
        status: "ERROR",
        message: `Gagal menghubungkan ke Groq API: ${err.message}`,
        logs: [],
      };
    }

    const data = event?.data || {};
    const nodes = data?.nodes || [];
    const edges = data?.edges || [];
    const initialInput = data?.initialInput || "";

    if (!nodes.length) {
      return { status: "ERROR", message: "Tidak ada node pada kanvas.", logs: [] };
    }

    const targetNodeIds = new Set(edges.map((e: any) => e.target));
    const startNode = nodes.find((n: any) => !targetNodeIds.has(n.id)) || nodes[0];

    if (!startNode) {
      return { status: "ERROR", message: "Node awal tidak ditemukan.", logs: [] };
    }

    let currentNodeId: string | null = startNode.id;
    const executionLogs: Array<{ nodeId: string; prompt: string; decision: string; reason?: string }> = [];

    while (currentNodeId) {
      const currentNode = nodes.find((n: any) => n.id === currentNodeId);
      if (!currentNode) break;

      const nodePrompt = currentNode.data?.prompt || "";
      const stepNodeId = currentNodeId;

      const stepResult: { decision: "YES" | "NO"; reason: string } = await step.run(
        `eval-${stepNodeId}-${Date.now()}`,
        async () => {
          const response = await groq.chat.completions.create({
            model: selectedModel,
            temperature: 0,
            response_format: { type: "json_object" }, // Memaksa AI merespons JSON murni
            messages: [
              {
                role: "system",
                content: `Kamu adalah mesin evaluator logika keputusan biner yang netral dan sangat objektif.

Tugasmu: Bandingkan "Pesan Pengguna" secara ketat HANYA terhadap "Kriteria Evaluasi".

Aturan Evaluasi:
1. Bersikaplah spesifik. Jika kriteria bertanya soal Pembayaran/Refund, dan pesan pengguna adalah soal Error/Aplikasi Crash tanpa menyebutkan uang/pembayaran, jawab "NO".
2. Pahami angka tulisan: 'satu juta' = 1.000.000, 'dua juta' = 2.000.000 (artinya > 1 Juta).
3. Format Jawaban: WAJIB dalam JSON seperti ini:
{
  "reasoning": "penjelasan analisis singkat 1 kalimat",
  "decision": "YES" atau "NO"
}`,
              },
              {
                role: "user",
                content: `Kriteria Evaluasi Node: "${nodePrompt}"\nPesan Pengguna: "${initialInput}"`,
              },
            ],
          });

          const rawContent = response.choices[0]?.message?.content?.trim() || "{}";
          
          try {
            const parsed = JSON.parse(rawContent);
            const decision = parsed.decision?.toUpperCase().includes("YES") ? "YES" : "NO";
            return {
              decision,
              reason: parsed.reasoning || "Evaluasi berhasil.",
            };
          } catch {
            // Fallback jika terjadi kegagalan parsing JSON
            const isYes = rawContent.toUpperCase().includes("YES");
            return {
              decision: isYes ? "YES" : "NO",
              reason: "Fallback text matching",
            };
          }
        }
      );

      executionLogs.push({
        nodeId: stepNodeId,
        prompt: nodePrompt,
        decision: stepResult.decision,
        reason: stepResult.reason,
      });

      const matchingEdge = edges.find(
        (e: any) => e.source === stepNodeId && e.sourceHandle === stepResult.decision.toLowerCase()
      );

      currentNodeId = matchingEdge ? matchingEdge.target : null;
    }

    return {
      status: "COMPLETED",
      modelUsed: selectedModel,
      initialInput,
      logs: executionLogs,
    };
  }
);