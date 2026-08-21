// src/inngest/workflow.ts
import { inngest } from "./client";
import OpenAI from "openai";

export const executeWorkflow = (inngest.createFunction as any)(
  {
    id: "execute-ai-workflow",
    triggers: [{ event: "workflow/run" }],
  },
  async ({ event, step }: { event: any; step: any }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    const openai = apiKey ? new OpenAI({ apiKey }) : null;

    const data = event?.data || {};
    const nodes = data?.nodes || [];
    const edges = data?.edges || [];
    const initialInput = data?.initialInput || "";

    if (!nodes.length) {
      return { status: "ERROR", message: "Tidak ada node ditemukan pada kanvas.", logs: [] };
    }

    const targetNodeIds = new Set(edges.map((e: any) => e.target));
    const startNode = nodes.find((n: any) => !targetNodeIds.has(n.id)) || nodes[0];

    if (!startNode) {
      return { status: "ERROR", message: "Node awal tidak ditemukan.", logs: [] };
    }

    let currentNodeId: string | null = startNode.id;
    const executionLogs: Array<{ nodeId: string; prompt: string; decision: string }> = [];

    while (currentNodeId) {
      const currentNode = nodes.find((n: any) => n.id === currentNodeId);
      if (!currentNode) break;

      const nodePrompt = currentNode.data?.prompt || "";
      const stepNodeId = currentNodeId;

      const decision: "YES" | "NO" = await step.run(
        `evaluate-node-${stepNodeId}`,
        async () => {
          try {
            if (!openai) throw new Error("No API Key");

            const response = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              temperature: 0,
              messages: [
                {
                  role: "system",
                  content:
                    'Kamu adalah agen penilai keputusan. Evaluasi input pengguna berdasarkan kondisi yang diberikan. Jawab HANYA dengan kata "YES" atau "NO".',
                },
                {
                  role: "user",
                  content: `Data Input: "${initialInput}"\nKondisi Evaluasi: "${nodePrompt}"`,
                },
              ],
            });

            const resultText = response.choices[0]?.message?.content?.trim().toUpperCase();
            return resultText === "YES" ? "YES" : "NO";
          } catch (error) {
            // Fallback otomatis jika saldo OpenAI habis (Error 429)
            const inputLower = initialInput.toLowerCase();
            const keywords = ["bantuan", "login", "error", "terkunci", "masalah", "password", "ya", "yes"];
            const isMatched = keywords.some((kw) => inputLower.includes(kw));
            return isMatched ? "YES" : "NO";
          }
        }
      );

      executionLogs.push({
        nodeId: stepNodeId,
        prompt: nodePrompt,
        decision,
      });

      const matchingEdge = edges.find(
        (e: any) => e.source === stepNodeId && e.sourceHandle === decision.toLowerCase()
      );

      currentNodeId = matchingEdge ? matchingEdge.target : null;
    }

    return {
      status: "COMPLETED",
      initialInput,
      logs: executionLogs,
    };
  }
);