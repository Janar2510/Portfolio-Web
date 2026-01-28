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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Products</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Product</DialogTitle>
                <DialogDescription>
                  Add a new product to your catalog
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Product Code</Label>
                  <Input id="code" name="code" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit_price">Unit Price</Label>
                    <Input
                      id="unit_price"
                      name="unit_price"
                      type="number"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select name="currency" defaultValue="EUR">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input id="unit" name="unit" defaultValue="unit" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_percentage">Tax %</Label>
                    <Input
                      id="tax_percentage"
                      name="tax_percentage"
                      type="number"
                      step="0.01"
                      defaultValue="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    {product.code && (
                      <p className="text-sm text-muted-foreground">
                        Code: {product.code}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingProduct(product)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {product.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {product.description}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {product.unit_price && (
                  <Badge variant="secondary">
                    {product.unit_price.toFixed(2)} {product.currency}
                  </Badge>
                )}
                {product.category && (
                  <Badge variant="outline">{product.category}</Badge>
                )}
                {product.tax_percentage > 0 && (
                  <Badge variant="outline">
                    Tax: {product.tax_percentage}%
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
          onOpenChange={() => setEditingProduct(null)}
        >
          <DialogContent>
            <form onSubmit={handleUpdate}>
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>Update product details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Product Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingProduct.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Product Code</Label>
                  <Input
                    id="edit-code"
                    name="code"
                    defaultValue={editingProduct.code || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    rows={3}
                    defaultValue={editingProduct.description || ''}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-unit_price">Unit Price</Label>
                    <Input
                      id="edit-unit_price"
                      name="unit_price"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct.unit_price || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-currency">Currency</Label>
                    <Select
                      name="currency"
                      defaultValue={editingProduct.currency}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-unit">Unit</Label>
                    <Input
                      id="edit-unit"
                      name="unit"
                      defaultValue={editingProduct.unit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tax_percentage">Tax %</Label>
                    <Input
                      id="edit-tax_percentage"
                      name="tax_percentage"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct.tax_percentage}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    name="category"
                    defaultValue={editingProduct.category || ''}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
