'use client';

import { useCallback, useState } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Plus, Save, Layout } from 'lucide-react';

const initialNodes: Node[] = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: 'Central Idea' }, type: 'input' },
];

interface MindMapEditorProps {
    initialNodes?: any[];
    initialEdges?: any[];
    onSave: (nodes: any[], edges: any[]) => void;
    editable?: boolean;
}

export function MindMapEditor({ initialNodes: defaultNodes, initialEdges: defaultEdges, onSave, editable = true }: MindMapEditorProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes || initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges || []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const addNode = () => {
        const id = Math.random().toString();
        const newNode: Node = {
            id,
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: 'New Idea' },
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const handleSave = () => {
        onSave(nodes, edges);
    };

    return (
        <div className="w-full h-full flex flex-col bg-zinc-950 border border-white/10 rounded-xl overflow-hidden">
            {editable && (
                <div className="flex items-center gap-2 p-2 border-b border-white/5 bg-white/5 z-10">
                    <Button onClick={addNode} size="sm" variant="secondary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Node
                    </Button>
                    <Button onClick={handleSave} size="sm" className="bg-primary text-white">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                    </Button>
                </div>
            )}

            <div className="flex-1 w-full h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    className="bg-zinc-950"
                >
                    <Controls />
                    <MiniMap className="bg-zinc-900 border border-white/10 !bottom-4 !right-4" nodeColor="#38bdf8" />
                    <Background color="#333" gap={16} />
                </ReactFlow>
            </div>
        </div>
    );
}
