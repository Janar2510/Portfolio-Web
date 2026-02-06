
export interface MindMap {
    id: string;
    user_id: string;
    project_id?: string | null;
    title: string;
    nodes: any[]; // React Flow Nodes
    edges: any[]; // React Flow Edges
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export type CreateMindMapDTO = Pick<MindMap, 'title'> & { project_id?: string, nodes?: any[], edges?: any[] };
export type UpdateMindMapDTO = Partial<CreateMindMapDTO> & { is_public?: boolean };
