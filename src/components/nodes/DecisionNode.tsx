// src/components/nodes/DecisionNode.tsx
'use client';

import { useState } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Bot, HelpCircle } from 'lucide-react';

/**
 * Interface untuk data kustom yang disimpan di dalam node ini.
 */
export type DecisionNodeData = {
  label: string;
  prompt: string;
  onPromptChange?: (id: string, newPrompt: string) => void;
};

export type DecisionNodeType = Node<DecisionNodeData, 'decisionNode'>;

export default function DecisionNode({ id, data }: NodeProps<DecisionNodeType>) {
  const [prompt, setPrompt] = useState(data.prompt || '');

  // Menangani perubahan teks prompt dan meneruskannya ke state utama
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPrompt(value);
    if (data.onPromptChange) {
      data.onPromptChange(id, value);
    }
  };

  return (
    <div className="bg-slate-800 border-2 border-slate-600 rounded-xl p-4 shadow-xl w-72 text-slate-100">
      {/* Target Handle: Titik masuk garis alur dari node sebelumnya (Atas) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-slate-400 border-2 border-slate-800"
      />

      {/* Header Node */}
      <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
        <Bot className="w-5 h-5 text-blue-400" />
        <span className="font-semibold text-xs text-slate-200 uppercase tracking-wider">
          AI Decision Step
        </span>
      </div>

      {/* Form Input Prompt AI */}
      <div className="space-y-2">
        <label className="text-xs text-slate-400 flex items-center gap-1 font-medium">
          <HelpCircle className="w-3.5 h-3.5" /> Pertanyaan / Prompt AI:
        </label>
        <textarea
          value={prompt}
          onChange={handleChange}
          placeholder="Misal: Apakah pesan ini berisi komplain darurat?"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none h-20"
        />
      </div>

      {/* Source Handles: Titik keluar alur berdasarkan hasil AI (Bawah) */}
      <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-700/50 text-[10px] font-bold">
        {/* Cabang YES (Kiri Bawah) */}
        <div className="relative flex items-center gap-1 text-emerald-400">
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            style={{ left: '25%' }}
            className="w-3 h-3 !bg-emerald-500 border-2 border-slate-800"
          />
          <span>YES</span>
        </div>

        {/* Cabang NO (Kanan Bawah) */}
        <div className="relative flex items-center gap-1 text-rose-400">
          <span>NO</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            style={{ left: '75%' }}
            className="w-3 h-3 !bg-rose-500 border-2 border-slate-800"
          />
        </div>
      </div>
    </div>
  );
}