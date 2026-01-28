import { z } from 'zod';

export const VisibleToSchema = z.enum(['owner', 'team', 'everyone']);
export const DealStatusSchema = z.enum(['open', 'won', 'lost', 'deleted']);
export const StageTypeSchema = z.enum(['normal', 'won', 'lost']);
export const LeadStatusSchema = z.enum(['new', 'contacted', 'qualified', 'converted', 'archived']);

/**
 * Address Schema
 */
export const AddressSchema = z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postal: z.string().optional(),
});

/**
 * Organization (Company)
 */
export const OrganizationSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    name: z.string().min(1, 'Name is required'),
    address: AddressSchema.optional(),
    label_ids: z.array(z.string().uuid()).default([]),
    owner_id: z.string().uuid().optional(),
    custom_fields: z.record(z.any()).default({}),
    visible_to: VisibleToSchema.default('everyone'),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    is_deleted: z.boolean().default(false),
    deleted_at: z.string().datetime().nullable().optional(),
});

export type Organization = z.infer<typeof OrganizationSchema>;

/**
 * Person (Contact)
 */
export const PersonSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    name: z.string().min(1, 'Name is required'),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    organization_id: z.string().uuid().nullable().optional(), // Reference to Org ID
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
    owner_id: z.string().uuid().optional(),
    custom_fields: z.record(z.any()).default({}),
    visible_to: VisibleToSchema.default('everyone'),
    last_activity_at: z.string().datetime().nullable().optional(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    is_deleted: z.boolean().default(false),
    deleted_at: z.string().datetime().nullable().optional(),
});

export type Person = z.infer<typeof PersonSchema>;

/**
 * Deal (Pipeline Item)
 */
export const DealSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    title: z.string().min(1, 'Title is required'),
    value: z.number().default(0),
    currency: z.string().length(3).default('EUR'),
    pipeline_id: z.string().uuid(),
    stage_id: z.string().uuid(),
    person_id: z.string().uuid().nullable().optional(), // ID-first reference
    organization_id: z.string().uuid().nullable().optional(), // ID-first reference
    status: DealStatusSchema.default('open'),
    won_time: z.string().datetime().optional(),
    lost_time: z.string().datetime().optional(),
    lost_reason: z.string().optional(),
    expected_close_date: z.string().datetime().optional(),
    owner_id: z.string().uuid().optional(),
    label_ids: z.array(z.string().uuid()).default([]),
    custom_fields: z.record(z.any()).default({}),
    visible_to: VisibleToSchema.default('everyone'),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    is_deleted: z.boolean().default(false),
});

export type Deal = z.infer<typeof DealSchema>;

/**
 * Activity
 */
export const ActivitySchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    activity_type: z.enum(['call', 'meeting', 'task', 'deadline', 'email', 'lunch']).default('task'),
    subject: z.string().min(1, 'Subject is required'),
    note: z.string().optional(),
    due_date: z.string().optional(), // YYYY-MM-DD
    due_time: z.string().optional(), // HH:mm
    deal_id: z.string().uuid().nullable().optional(),
    person_id: z.string().uuid().nullable().optional(),
    organization_id: z.string().uuid().nullable().optional(),
    is_done: z.boolean().default(false),
    done_at: z.string().datetime().optional(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});

export type Activity = z.infer<typeof ActivitySchema>;

/**
 * Lead Schema
 */
export const LeadSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    title: z.string().min(1, 'Title is required'),
    source_name: z.string().optional(),
    person_name: z.string().optional(),
    organization_name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    status: LeadStatusSchema.default('new'),
    owner_id: z.string().uuid().optional(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});

export type Lead = z.infer<typeof LeadSchema>;

/**
 * Product Schema
 */
export const ProductSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    name: z.string().min(1, 'Name is required'),
    code: z.string().optional(),
    unit_price: z.number().default(0),
    currency: z.string().length(3).default('EUR'),
    is_active: z.boolean().default(true),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});

export type Product = z.infer<typeof ProductSchema>;

/**
 * Email Link Schema
 */
export const EmailLinkSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    email_id: z.string().uuid(),
    contact_id: z.string().uuid().nullable().optional(),
    company_id: z.string().uuid().nullable().optional(),
    deal_id: z.string().uuid().nullable().optional(),
    created_at: z.string().datetime(),
});

export type EmailLink = z.infer<typeof EmailLinkSchema>;
