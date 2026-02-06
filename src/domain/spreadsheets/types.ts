
export interface Spreadsheet {
    id: string;
    user_id: string;
    project_id?: string | null;
    title: string;
    columns: any[]; // react-data-grid columns
    rows: any[]; // react-data-grid rows
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export type CreateSpreadsheetDTO = Pick<Spreadsheet, 'title'> & { project_id?: string, columns?: any[], rows?: any[] };
export type UpdateSpreadsheetDTO = Partial<CreateSpreadsheetDTO> & { is_public?: boolean };
