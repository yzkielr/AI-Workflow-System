// src/components/LogsPanel.tsx
'use client';

import { Terminal, CheckCircle2, XCircle, X } from 'lucide-react';

export type LogItem = {
  nodeId: string;
  prompt: string;
  decision: string;
};

type LogsPanelProps = {
  logs: LogItem[];
  isOpen: boolean;
  onClose: () => void;
};

export default function LogsPanel({ logs, isOpen, onClose }: LogsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-4 top-4 z-20 w-80 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Header Panel */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-2 text-slate-200">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Execution Logs</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Log List */}
      <div className="p-3 max-h-[70vh] overflow-y-auto space-y-2.5 font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-slate-500 text-[11px] text-center py-4">Belum ada eksekusi workflow.</p>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className="bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-blue-400 font-semibold uppercase">
                  Step {index + 1}: {log.nodeId}
                </span>
                <span
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    log.decision === 'YES'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                  }`}
                >
                  {log.decision === 'YES' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />)}
                  {log.decision}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{log.prompt}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}