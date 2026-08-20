// src/app/api/run-workflow/route.ts
import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
  try {
    const { nodes, edges, initialInput } = await req.json();

    if (!nodes || nodes.length === 0) {
      return NextResponse.json({ error: "Kanvas kosong!" }, { status: 400 });
    }

    // Trigger event workflow/run ke Inngest
    const { ids } = await inngest.send({
      name: "workflow/run",
      data: {
        nodes,
        edges,
        initialInput: initialInput || "Pesan default test",
      },
    });

    return NextResponse.json({
      message: "Workflow berhasil dipicu!",
      eventId: ids[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}