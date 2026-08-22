// src/components/nodes/DecisionNode.tsx
'use client';

import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

export interface DecisionNodeData {
  label: string;
  prompt: string;
  onPromptChange?: (id: string, prompt: string) => void;
}

export interface DecisionNodeType {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: DecisionNodeData;
}

export default function DecisionNode({ id, data }: { id: string; data: DecisionNodeData }) {
  const { setNodes, setEdges } = useReactFlow();

  // Fungsi Hapus Node Langsung
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah drag node terpicu saat tombol diklik
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 w-64 shadow-xl text-white relative group">
      {/* Target Handle (Input dari Node sebelumnya) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3 !-top-1.5"
      />

      {/* Header Node & Tombol Hapus */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
        <span className="text-xs font-bold text-slate-300">{data.label || 'Decision Node'}</span>
        
        {/* Tombol Hapus di Dalam Node */}
        <button
          onClick={handleDelete}
          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded transition-colors"
          title="Hapus Node Ini"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Input Prompt Evaluasi */}
      <div className="space-y-1">
        <label className="text-[10px] text-slate-400 font-medium uppercase">Prompt Evaluasi:</label>
        <textarea
          value={data.prompt || ''}
          onChange={(e) => data.onPromptChange && data.onPromptChange(id, e.target.value)}
          placeholder="Ketik kondisi/prompt AI..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none h-16"
        />
      </div>

      {/* Source Handles (Output YES / NO) */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800 text-[10px] font-bold">
        <div className="flex items-center gap-1 text-emerald-400 relative">
          <span>YES</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            className="!bg-emerald-500 !w-3 !h-3 !-bottom-3 !left-3"
          />
        </div>
        <div className="flex items-center gap-1 text-rose-400 relative">
          <span>NO</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            className="!bg-rose-500 !w-3 !h-3 !-bottom-3 !right-3"
          />
        </div>
      </div>
    </div>
  );
}