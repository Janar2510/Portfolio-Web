import { ValidationError } from './errors';

/**
 * Converts a string into a URL-friendly slug.
 */
export function slugify(input: string): string {
    if (!input) return 'site';

    const slug = input
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')       // Replace spaces and underscores with hyphens
        .replace(/[^a-z0-9-]/g, '')     // Remove non-alphanumeric characters except hyphens
        .replace(/-+/g, '-')            // Collapse multiple hyphens
        .replace(/^-+|-+$/g, '');       // Trim hyphens from ends

    return slug || 'site';
}

/**
 * Ensures a slug is unique by appending numerical suffixes if necessary.
 */
export async function ensureUniqueSlug(
    desired: string,
    exists: (slug: string) => Promise<boolean>
): Promise<string> {
    const base = slugify(desired);

    if (!(await exists(base))) {
        return base;
    }

    // Try appending -2, -3, ... up to 200 times
    for (let i = 2; i <= 200; i++) {
        const candidate = `${base}-${i}`;
        if (!(await exists(candidate))) {
            return candidate;
        }
    }

    throw new ValidationError(`Could not generate unique slug for "${desired}" after 200 attempts.`);
}
