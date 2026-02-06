'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CRMEnhancedService } from '@/domain/crm/crm-enhanced';
import { ProductsList } from '@/components/crm/ProductsList';
import { Sparkles, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Product } from '@/domain/crm/types';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const crmService = new CRMEnhancedService(supabase);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['crm-products'],
    queryFn: () => crmService.getProducts(),
  });

  const createMutation = useMutation({
    mutationFn: (product: Partial<Product>) =>
      // @ts-ignore - Partial issue
      crmService.createProduct(product as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-products'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
      crmService.updateProduct(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-products'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => crmService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-products'] });
    },
  });

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-[1440px] mx-auto py-12 px-6">
      {/* Pulse-style Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Inventory Active
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white m-0 font-display">
            Products
          </h1>
          <p className="text-lg text-white/40 max-w-xl">
            Everything is running smoothly. Manage your product catalog.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            size="lg"
            className="gap-2 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-glow-seafoam px-8 h-12"
            onClick={() => {
              // This is typically handled inside ProductsList or a parent modal
              // For now, let's keep it consistent with the UI
            }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      <ProductsList
        products={products}
        onCreateProduct={async product => {
          await createMutation.mutateAsync(product);
        }}
        onUpdateProduct={async (id, updates) => {
          await updateMutation.mutateAsync({ id, updates });
        }}
        onDeleteProduct={async id => {
          await deleteMutation.mutateAsync(id);
        }}
      />
    </div>
  );
}
