import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useProducts } from '../contexts/ProductContext';
import { Product } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Search, AlertTriangle, X } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import ProductSearchInput from '@/components/products/ProductSearchInput';
import NoProductsFound from '@/components/products/NoProductsFound';
import ProductTable from '@/components/products/ProductTable';
import ProductDialog from '@/components/products/ProductDialog';

const Products = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: '',
    barcode: '',
    category: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    minStock: 0,
    unit: 'piece',
    imageUrl: ''
  });
  
  const resetForm = () => {
    setFormData({
      name: '',
      barcode: '',
      category: '',
      price: 0,
      costPrice: 0,
      stock: 0,
      minStock: 0,
      unit: 'piece',
      imageUrl: ''
    });
    setEditingProduct(null);
  };
  
  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct({ ...formData, id: editingProduct.id });
      } else {
        await addProduct(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };
  
  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(productId);
    }
  };
  
  const filteredProducts = searchTerm
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm)
      )
    : products;
  
  // Hardcoded categories for the dialog's datalist
  const categories = ["Drinks", "Eatery"];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-gray-500">Manage inventory products</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
        
        <ProductSearchInput 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {loading ? (
          <div className="text-center py-10">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <NoProductsFound 
            searchTerm={searchTerm}
            onClearSearch={() => setSearchTerm('')}
          />
        ) : (
          <ProductTable 
            products={filteredProducts}
            onEditProduct={handleOpenDialog}
            onDeleteProduct={handleDelete}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
      
      <ProductDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingProduct={editingProduct}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onClose={handleCloseDialog}
        categories={categories}
      />
    </Layout>
  );
};

export default Products;
