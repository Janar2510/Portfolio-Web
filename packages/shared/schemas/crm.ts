import { z } from 'zod';

export const VisibleToSchema = z.enum(['owner', 'team', 'everyone']);

export const AddressSchema = z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postal: z.string().optional(),
});

export const OrganizationSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    name: z.string().min(1, 'Name is required'),
    domain: z.string().optional(),
    address: AddressSchema.optional(),
    label_ids: z.array(z.string().uuid()).default([]),
    owner_user_id: z.string().uuid().optional(),
    custom_fields: z.record(z.any()).default({}),
    visible_to: VisibleToSchema.default('everyone'),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    deleted_at: z.string().datetime().nullable().optional(),
});

export const PersonSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    name: z.string().min(1, 'Name is required'),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    organization_id: z.string().uuid().nullable().optional(),
    job_title: z.string().optional(),
    emails: z.array(z.object({
        value: z.string().email(),
        label: z.string().default('work'),
        primary: z.boolean().default(false),
    })).default([]),
    phones: z.array(z.object({
        value: z.string(),
        label: z.string().default('work'),
        primary: z.boolean().default(false),
    })).default([]),
    label_ids: z.array(z.string().uuid()).default([]),
    owner_user_id: z.string().uuid().optional(),
    custom_fields: z.record(z.any()).default({}),
    visible_to: VisibleToSchema.default('everyone'),
    avatar_url: z.string().url().optional().nullable(),
    last_activity_at: z.string().datetime().nullable().optional(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    deleted_at: z.string().datetime().nullable().optional(),
});

export type Organization = z.infer<typeof OrganizationSchema>;
export type Person = z.infer<typeof PersonSchema>;
