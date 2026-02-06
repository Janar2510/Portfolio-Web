
export interface Notification {
    id: string;
    user_id: string;
    type: 'assignment' | 'mention' | 'system' | 'due_date';
    title: string;
    message?: string;
    entity_type?: 'task' | 'project' | 'comment';
    entity_id?: string;
    is_read: boolean;
    data?: Record<string, any>;
    created_at: string;
}

export type CreateNotificationDTO = Omit<Notification, 'id' | 'created_at' | 'is_read'>;
