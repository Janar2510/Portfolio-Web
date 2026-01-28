import { createClient } from '@/lib/supabase/client';
import { Product, ProductSchema } from '../schemas';
import { z } from 'zod';

export class ProductsService {
    private supabase = createClient();

    async getById(id: string): Promise<Product | null> {
        const { data, error } = await this.supabase
            .from('crm_products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return ProductSchema.parse(data);
    }

    async getAll(): Promise<Product[]> {
        const { data, error } = await this.supabase
            .from('crm_products')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;
        return z.array(ProductSchema).parse(data || []);
    }

    async create(data: Partial<Product>): Promise<Product> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const newProduct = {
            ...data,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data: created, error } = await this.supabase
            .from('crm_products')
            .insert(newProduct)
            .select()
            .single();

        if (error) throw error;
        return ProductSchema.parse(created);
    }
}

export const productsService = new ProductsService();
