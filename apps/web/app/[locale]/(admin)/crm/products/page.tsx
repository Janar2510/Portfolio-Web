'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { CRMEnhancedService } from '@/lib/services/crm-enhanced';
import { ProductsList } from '@/components/crm/ProductsList';
import type { Product } from '@/lib/crm/types';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const crmService = new CRMEnhancedService(supabase);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['crm-products'],
    queryFn: () => crmService.getProducts(),
  });

  const createMutation = useMutation({
    mutationFn: (product: Partial<Product>) => crmService.createProduct(product),
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

  if (isLoading) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">Manage your product catalog</p>
      </div>

      <ProductsList
        products={products}
        onCreateProduct={async (product) => {
          await createMutation.mutateAsync(product);
        }}
        onUpdateProduct={async (id, updates) => {
          await updateMutation.mutateAsync({ id, updates });
        }}
        onDeleteProduct={async (id) => {
          await deleteMutation.mutateAsync(id);
        }}
      />
    </div>
  );
}
