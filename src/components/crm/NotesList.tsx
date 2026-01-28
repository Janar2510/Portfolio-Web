'use client';

import { useState } from 'react';
import { Plus, Pin, PinOff, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Note } from '@/domain/crm/types';

interface NotesListProps {
  notes: Note[];
  onCreateNote: (note: {
    content: string;
    is_pinned?: boolean;
  }) => Promise<void>;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  entityType?: 'deal' | 'person' | 'organization' | 'lead';
  entityId?: string;
}

export function NotesList({
  notes,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  entityType,
  entityId,
}: NotesListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');

  const pinnedNotes = notes.filter(n => n.is_pinned);
  const regularNotes = notes.filter(n => !n.is_pinned);

  const handleCreate = async () => {
    if (!newNoteContent.trim()) return;

    await onCreateNote({
      content: newNoteContent.trim(),
      is_pinned: false,
    });

    setNewNoteContent('');
    setIsCreateOpen(false);
  };

  const handleUpdate = async () => {
    if (!editingNote || !newNoteContent.trim()) return;

    await onUpdateNote(editingNote.id, {
      content: newNoteContent.trim(),
    });

    setEditingNote(null);
    setNewNoteContent('');
  };

  const handleTogglePin = async (note: Note) => {
    await onUpdateNote(note.id, {
      is_pinned: !note.is_pinned,
    });
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    await onDeleteNote(noteId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Notes</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="add-note-description">
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
              <DialogDescription id="add-note-description">Add a note to this record</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="note-content">Note</Label>
                <Textarea
                  id="note-content"
                  value={newNoteContent}
                  onChange={e => setNewNoteContent(e.target.value)}
                  placeholder="Write your note here..."
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleCreate}>
                Add Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Pinned</h4>
          {pinnedNotes.map(note => (
            <Card key={note.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pin className="h-4 w-4 text-primary-500" />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setEditingNote(note);
                        setNewNoteContent(note.content);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleTogglePin(note)}
                    >
                      <PinOff className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Regular Notes */}
      {regularNotes.length > 0 && (
        <div className="space-y-2">
          {pinnedNotes.length > 0 && (
            <h4 className="text-sm font-medium text-muted-foreground">
              All Notes
            </h4>
          )}
          {regularNotes.map(note => (
            <Card key={note.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setEditingNote(note);
                        setNewNoteContent(note.content);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleTogglePin(note)}
                    >
                      <Pin className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {notes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No notes yet. Add your first note to get started.</p>
        </div>
      )}

      {/* Edit Dialog */}
      {editingNote && (
        <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
          <DialogContent aria-describedby="edit-note-description">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription id="edit-note-description">Update your note</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-note-content">Note</Label>
                <Textarea
                  id="edit-note-content"
                  value={newNoteContent}
                  onChange={e => setNewNoteContent(e.target.value)}
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingNote(null)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleUpdate}>
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
