'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, User, Flag, CheckCircle2, MessageSquare, Paperclip, Plus, Trash2, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Task, Subtask, TaskComment } from '@/lib/services/projects';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  subtasks: Subtask[];
  comments: TaskComment[];
  onSubtaskCreate: (taskId: string, title: string) => Promise<void>;
  onSubtaskUpdate: (subtaskId: string, updates: Partial<Subtask>) => Promise<void>;
  onSubtaskDelete: (subtaskId: string) => Promise<void>;
  onCommentCreate: (taskId: string, content: string) => Promise<void>;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
  currentUserId?: string;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  subtasks,
  comments,
  onSubtaskCreate,
  onSubtaskUpdate,
  onSubtaskDelete,
  onCommentCreate,
  onCommentUpdate,
  onCommentDelete,
  currentUserId,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [editFormData, setEditFormData] = useState<Partial<Task>>({});

  useEffect(() => {
    if (task) {
      setEditFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date,
        assignee_id: task.assignee_id,
      });
      setIsEditing(false);
      setNewSubtaskTitle('');
      setNewCommentContent('');
      setEditingCommentId(null);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onUpdate(task.id, editFormData);
    setIsEditing(false);
  };

  const handleSubtaskCreate = async () => {
    if (!newSubtaskTitle.trim()) return;
    await onSubtaskCreate(task.id, newSubtaskTitle);
    setNewSubtaskTitle('');
  };

  const handleSubtaskToggle = async (subtask: Subtask) => {
    await onSubtaskUpdate(subtask.id, { is_completed: !subtask.is_completed });
  };

  const handleCommentCreate = async () => {
    if (!newCommentContent.trim()) return;
    await onCommentCreate(task.id, newCommentContent);
    setNewCommentContent('');
  };

  const handleCommentEdit = (comment: TaskComment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };

  const handleCommentSave = async (commentId: string) => {
    await onCommentUpdate(commentId, editingCommentContent);
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200',
  };

  const completedSubtasks = subtasks.filter((s) => s.is_completed).length;
  const totalSubtasks = subtasks.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="mb-2 text-lg font-semibold"
                  placeholder="Task title"
                />
              ) : (
                <DialogTitle className="text-lg font-semibold">
                  {task.title}
                </DialogTitle>
              )}
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this task?')) {
                        await onDelete(task.id);
                        onClose();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={4}
                placeholder="Add a description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={editFormData.priority || 'low'}
                  onValueChange={(value) => setEditFormData({ ...editFormData, priority: value as Task['priority'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={editFormData.due_date || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Task Details */}
            <div className="space-y-4">
              {task.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {task.priority && (
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-muted-foreground" />
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-xs font-medium',
                        priorityColors[task.priority]
                      )}
                    >
                      {task.priority}
                    </span>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(task.due_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {task.assignee_id && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Assigned</span>
                  </div>
                )}
              </div>
            </div>

            {/* Subtasks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Subtasks ({completedSubtasks}/{totalSubtasks})
                </Label>
              </div>
              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-2 rounded-md border p-2"
                  >
                    <Checkbox
                      checked={subtask.is_completed}
                      onCheckedChange={() => handleSubtaskToggle(subtask)}
                    />
                    <span
                      className={cn(
                        'flex-1 text-sm',
                        subtask.is_completed && 'line-through text-muted-foreground'
                      )}
                    >
                      {subtask.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onSubtaskDelete(subtask.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubtaskCreate();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={handleSubtaskCreate}
                    disabled={!newSubtaskTitle.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Comments</Label>
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-md border bg-muted/30 p-3"
                  >
                    {editingCommentId === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingCommentContent}
                          onChange={(e) => setEditingCommentContent(e.target.value)}
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingCommentContent('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCommentSave(comment.id)}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                        {currentUserId === comment.user_id && (
                          <div className="mt-2 flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCommentEdit(comment)}
                            >
                              <Edit2 className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => {
                                if (confirm('Delete this comment?')) {
                                  onCommentDelete(comment.id);
                                }
                              }}
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleCommentCreate}
                    disabled={!newCommentContent.trim()}
                    size="sm"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
