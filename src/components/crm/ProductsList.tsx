'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/domain/crm/types';

interface ProductsListProps {
  products: Product[];
  onCreateProduct: (product: Partial<Product>) => Promise<void>;
  onUpdateProduct: (
    productId: string,
    updates: Partial<Product>
  ) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
}

export function ProductsList({
  products,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
}: ProductsListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await onCreateProduct({
      name: formData.get('name') as string,
      code: formData.get('code')?.toString(),
      description: formData.get('description')?.toString(),
      unit_price: formData.get('unit_price')
        ? Number(formData.get('unit_price'))
        : undefined,
      currency: (formData.get('currency') as string) || 'EUR',
      unit: formData.get('unit')?.toString() || 'unit',
      tax_percentage: formData.get('tax_percentage')
        ? Number(formData.get('tax_percentage'))
        : 0,
      category: formData.get('category')?.toString(),
    });

    setIsCreateOpen(false);
    e.currentTarget.reset();
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;

    const formData = new FormData(e.currentTarget);
    await onUpdateProduct(editingProduct.id, {
      name: formData.get('name') as string,
      code: formData.get('code')?.toString(),
      description: formData.get('description')?.toString(),
      unit_price: formData.get('unit_price')
        ? Number(formData.get('unit_price'))
        : undefined,
      currency: formData.get('currency') as string,
      unit: formData.get('unit')?.toString(),
      tax_percentage: formData.get('tax_percentage')
        ? Number(formData.get('tax_percentage'))
        : 0,
      category: formData.get('category')?.toString(),
    });

    setEditingProduct(null);
    e.currentTarget.reset();
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await onDeleteProduct(productId);
  };

  return (
    <div className="space-y-4">
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <Card key={product.id} className="surface-elevated border-white/5 bg-white/[0.02] backdrop-blur-sm rounded-3xl overflow-hidden hover:bg-white/[0.04] transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white font-display">
                      {product.name}
                    </h3>
                    {product.code && (
                      <p className="text-xs text-white/40 uppercase tracking-widest font-mono">
                        {product.code}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-white/40 hover:text-white hover:bg-white/5"
                    onClick={() => setEditingProduct(product)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-white/20 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {product.description && (
                <p className="text-sm text-white/60 mb-6 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-white/5">
                {product.unit_price != null && (
                  <Badge className="bg-primary/20 text-primary border-none font-bold px-3 py-1">
                    {product.unit_price.toFixed(2)} {product.currency}
                  </Badge>
                )}
                {product.category && (
                  <Badge variant="outline" className="border-white/10 text-white/40 font-medium">
                    {product.category}
                  </Badge>
                )}
                {product.tax_percentage > 0 && (
                  <Badge variant="outline" className="border-white/10 text-white/40 font-medium">
                    {product.tax_percentage}% tax
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingProduct && (
        <Dialog
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
        >
          <DialogContent className="max-w-md bg-[hsl(var(--bg-elevated))] border-white/5 text-white rounded-[2rem]">
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-display">Edit Product</DialogTitle>
                <DialogDescription className="text-white/40">
                  Update product details in your catalog
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-white/60">Product Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingProduct.name}
                    className="bg-white/5 border-white/10 text-white rounded-xl focus:ring-primary/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-code" className="text-white/60">Product Code</Label>
                  <Input
                    id="edit-code"
                    name="code"
                    defaultValue={editingProduct.code || ''}
                    className="bg-white/5 border-white/10 text-white rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-white/60">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    rows={3}
                    defaultValue={editingProduct.description || ''}
                    className="bg-white/5 border-white/10 text-white rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-unit_price" className="text-white/60">Unit Price</Label>
                    <Input
                      id="edit-unit_price"
                      name="unit_price"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct.unit_price || ''}
                      className="bg-white/5 border-white/10 text-white rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-currency" className="text-white/60">Currency</Label>
                    <Select
                      name="currency"
                      defaultValue={editingProduct.currency}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[hsl(var(--bg-elevated))] border-white/10 text-white">
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-unit" className="text-white/60">Unit</Label>
                    <Input
                      id="edit-unit"
                      name="unit"
                      defaultValue={editingProduct.unit}
                      className="bg-white/5 border-white/10 text-white rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tax_percentage" className="text-white/60">Tax %</Label>
                    <Input
                      id="edit-tax_percentage"
                      name="tax_percentage"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct.tax_percentage}
                      className="bg-white/5 border-white/10 text-white rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category" className="text-white/60">Category</Label>
                  <Input
                    id="edit-category"
                    name="category"
                    defaultValue={editingProduct.category || ''}
                    className="bg-white/5 border-white/10 text-white rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-white/10 hover:bg-white/5 text-white/60"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-primary text-white hover:bg-primary/90">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
