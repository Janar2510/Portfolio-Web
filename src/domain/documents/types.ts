
export interface Document {
    id: string;
    user_id: string;
    project_id?: string | null;
    title: string;
    content: Record<string, any>; // Tiptap JSON
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export type CreateDocumentDTO = Pick<Document, 'title' | 'content'> & { project_id?: string };
export type UpdateDocumentDTO = Partial<CreateDocumentDTO> & { is_public?: boolean };
