'use client';

import { useState, useCallback } from 'react';
import DataGrid, { Column, RenderEditCellProps } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { Button } from '@/components/ui/button';
import { Plus, Save, Columns } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Row {
    id: number;
    [key: string]: any;
}

interface SpreadsheetEditorProps {
    initialColumns?: Column<Row>[];
    initialRows?: Row[];
    onSave: (columns: any[], rows: any[]) => void;
    editable?: boolean;
}

export function SpreadsheetEditor({ initialColumns, initialRows, onSave, editable = true }: SpreadsheetEditorProps) {
    const [columns, setColumns] = useState<Column<Row>[]>(initialColumns || [
        { key: 'id', name: 'ID', width: 80 },
        { key: 'title', name: 'Title', width: 200, resizable: true, renderEditCell: textEditor },
    ]);
    const [rows, setRows] = useState<Row[]>(initialRows || [
        { id: 1, title: 'Example Row' }
    ]);
    const [newColumnName, setNewColumnName] = useState('');
    const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);

    const onRowsChange = useCallback((newRows: Row[]) => {
        setRows(newRows);
    }, []);

    const addRow = () => {
        const newId = Math.max(...rows.map(r => r.id), 0) + 1;
        setRows([...rows, { id: newId }]);
    };

    const addColumn = () => {
        if (!newColumnName) return;
        const key = newColumnName.toLowerCase().replace(/\s+/g, '_');
        setColumns([
            ...columns,
            { key, name: newColumnName, width: 150, resizable: true, renderEditCell: textEditor }
        ]);
        setNewColumnName('');
        setIsAddColumnOpen(false);
    };

    const handleSave = () => {
        // Strip out functions from columns before saving
        const cleanColumns = columns.map(({ renderEditCell, ...rest }) => rest);
        onSave(cleanColumns, rows);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 border border-white/10 rounded-xl overflow-hidden">
            {editable && (
                <div className="flex items-center gap-2 p-2 border-b border-white/5 bg-white/5">
                    <Button onClick={addRow} size="sm" variant="secondary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Row
                    </Button>

                    <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="secondary">
                                <Columns className="w-4 h-4 mr-2" />
                                Add Column
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-white/10">
                            <DialogHeader>
                                <DialogTitle>Add New Column</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Column Name</Label>
                                    <Input
                                        value={newColumnName}
                                        onChange={(e) => setNewColumnName(e.target.value)}
                                        placeholder="e.g. Status, Amount"
                                    />
                                </div>
                                <Button onClick={addColumn} className="w-full">Add Column</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <div className="flex-1" />

                    <Button onClick={handleSave} size="sm" className="bg-primary text-white">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                    </Button>
                </div>
            )}

            <div className="flex-1 overflow-auto rdg-dark-theme" style={{ '--rdg-background-color': '#09090b', '--rdg-color': '#fff', '--rdg-border-color': 'rgba(255,255,255,0.1)', '--rdg-header-background-color': '#18181b' } as any}>
                <DataGrid
                    columns={columns}
                    rows={rows}
                    onRowsChange={onRowsChange}
                    className="h-full border-none"
                    style={{ height: '100%' }}
                />
            </div>
        </div>
    );
}

function textEditor({ row, column, onRowChange, onClose }: RenderEditCellProps<Row>) {
    return (
        <input
            className="w-full h-full px-2 bg-zinc-900 text-white border-none focus:outline-none focus:ring-1 focus:ring-primary inset-0 absolute"
            autoFocus
            value={row[column.key as keyof Row] as string}
            onChange={(event) => onRowChange({ ...row, [column.key]: event.target.value })}
            onBlur={() => onClose(true)}
        />
    );
}
