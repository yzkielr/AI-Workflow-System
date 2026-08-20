// src/app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { executeWorkflow } from "@/inngest/workflow";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    executeWorkflow, // Regristrasi fungsi workflow di sini
  ],
});