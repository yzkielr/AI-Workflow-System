// src/components/FlowEditor.tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import DecisionNode, { DecisionNodeType } from './nodes/DecisionNode';
import LogsPanel, { LogItem } from './LogsPanel';
import { Plus, Play, Loader2, Download, Upload, Terminal } from 'lucide-react';

const nodeTypes = {
  decisionNode: DecisionNode,
};

const initialNodes: DecisionNodeType[] = [
  {
    id: 'node-1',
    type: 'decisionNode',
    position: { x: 250, y: 100 },
    data: {
      label: 'Decision 1',
      prompt: 'Apakah pesan ini berisi permintaan bantuan teknis atau masalah aplikasi?',
    },
  },
];

export default function FlowEditor() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [testInput, setTestInput] = useState('Aplikasi saya tidak bisa login dan menampilkan error 500!');
  const [isRunning, setIsRunning] = useState(false);
  const [runStatus, setRunStatus] = useState<string | null>(null);

  // State untuk Phase 4 Polish Features
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePromptChange = useCallback((id: string, newPrompt: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, prompt: newPrompt },
          };
        }
        return node;
      })
    );
  }, []);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      const isYesBranch = params.sourceHandle === 'yes';
      const newEdge: Edge = {
        ...params,
        id: `edge-${params.source}-${params.sourceHandle}-${params.target}`,
        animated: true,
        label: isYesBranch ? 'YES' : 'NO',
        style: {
          stroke: isYesBranch ? '#10b981' : '#f43f5e',
          strokeWidth: 2,
        },
        labelStyle: {
          fill: isYesBranch ? '#10b981' : '#f43f5e',
          fontWeight: 700,
          fontSize: 10,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    []
  );

  const addNode = () => {
    const newNodeId = `node-${nodes.length + 1}`;
    const newNode: DecisionNodeType = {
      id: newNodeId,
      type: 'decisionNode',
      position: { x: 100 + nodes.length * 40, y: 100 + nodes.length * 40 },
      data: {
        label: `Decision ${nodes.length + 1}`,
        prompt: '',
        onPromptChange: handlePromptChange,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // FEATURE 1: Export Workflow to JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, edges }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "ai-workflow.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // FEATURE 1: Import Workflow from JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.nodes && json.edges) {
          setNodes(json.nodes);
          setEdges(json.edges);
          setRunStatus("Workflow JSON berhasil dimuat!");
        }
      } catch (err) {
        alert("File JSON tidak valid!");
      }
    };
    reader.readAsText(file);
  };

  // FEATURE 2 & 3: Run Workflow & Highlight Visual State
  const handleRunWorkflow = async () => {
    setIsRunning(true);
    setRunStatus('Mengirim event ke Inngest...');

    try {
      const res = await fetch('/api/run-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, initialInput: testInput }),
      });

      const data = await res.json();
      if (res.ok) {
        setRunStatus(`Event dipicu! Membuka Inngest dev server...`);
        setShowLogs(true);
      } else {
        setRunStatus(`Gagal: ${data.error}`);
      }
    } catch (err: any) {
      setRunStatus(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full h-screen bg-slate-950 relative">
      {/* Header Panel Control */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-2xl space-y-3 max-w-md backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-sm font-bold text-white">AI Decision Flow Canvas</h1>
            <p className="text-[11px] text-slate-400">React Flow + Inngest Engine</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={addNode}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 transition-all"
              title="Tambah Node"
            >
              <Plus className="w-3.5 h-3.5" /> Node
            </button>
            <button
              onClick={handleExportJSON}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all"
              title="Export JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all"
              title="Import JSON"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJSON}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Input Data Pengujian */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-slate-400 uppercase">Input Teks Pengujian:</label>
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            placeholder="Masukkan teks input pengujian..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleRunWorkflow}
            disabled={isRunning}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-bold py-2 rounded-lg transition-all"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Run Workflow
              </>
            )}
          </button>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all"
            title="Toggle Logs Panel"
          >
            <Terminal className="w-4 h-4" />
          </button>
        </div>

        {/* Status Notifikasi */}
        {runStatus && (
          <p className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900 p-2 rounded-lg break-all">
            {runStatus}
          </p>
        )}
      </div>

      {/* Side Logs Panel */}
      <LogsPanel logs={logs} isOpen={showLogs} onClose={() => setShowLogs(false)} />

      {/* Interactive React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
        <Controls className="!bg-slate-900 !border-slate-800 !fill-slate-200" />
      </ReactFlow>
    </div>
  );
}