import { createClient } from '@/lib/supabase/client';

export class MediaService {
    private supabase = createClient();
    private bucket = 'portfolio-assets';

    /**
     * Upload a file to the media bucket
     */
    async uploadFile(file: File, path?: string): Promise<string> {
        const fileName = path || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

        // Convert base64/blob if needed, but assuming File object for now

        const { data, error } = await this.supabase
            .storage
            .from(this.bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = this.supabase
            .storage
            .from(this.bucket)
            .getPublicUrl(fileName);

        return publicUrl;
    }

    /**
     * Delete a file from storage
     */
    async deleteFile(url: string): Promise<void> {
        // Extract path from URL
        // URL format: .../storage/v1/object/public/portfolio-assets/filename.jpg
        const path = url.split(`${this.bucket}/`).pop();
        if (!path) return;

        const { error } = await this.supabase
            .storage
            .from(this.bucket)
            .remove([path]);

        if (error) {
            throw error;
        }
    }
}

export const mediaService = new MediaService();
