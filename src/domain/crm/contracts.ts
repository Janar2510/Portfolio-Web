import { Person, Organization } from './types';
import { PersonSchema, OrganizationSchema } from './schemas';
import { z } from 'zod';

/**
 * CRM Picker Contract
 * Unified interface for searching, selecting, and creating entities from a UI picker.
 */
export interface ICrmPicker<T, CreateSchema extends z.ZodType> {
    search(query: string): Promise<T[]>;
    selectExisting(id: string): Promise<T | null>;
    createNew(data: z.infer<CreateSchema>): Promise<T>;
}

/**
 * Schema for creating a Person via Picker
 */
export const PersonPickerCreateSchema = PersonSchema.omit({
    id: true,
    user_id: true,
    created_at: true,
    updated_at: true,
    is_deleted: true,
});

/**
 * Schema for creating an Organization via Picker
 */
export const OrganizationPickerCreateSchema = OrganizationSchema.omit({
    id: true,
    user_id: true,
    created_at: true,
    updated_at: true,
    is_deleted: true,
});
