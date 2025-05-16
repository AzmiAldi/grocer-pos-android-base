import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useProducts } from '../contexts/ProductContext';
import { Product } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import ProductSearchInput from '@/components/products/ProductSearchInput';
import NoProductsFound from '@/components/products/NoProductsFound';
import ProductTable from '@/components/products/ProductTable';
import ProductDialog from '@/components/products/ProductDialog';
import { useProductForm } from '@/hooks/useProductForm';

const Products = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    isDialogOpen,
    setIsDialogOpen,
    editingProduct,
    formData,
    handleOpenDialog,
    handleCloseDialog,
    handleInputChange,
    handleSubmit,
  } = useProductForm({ addProduct, updateProduct });
  
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
            onEditProduct={handleOpenDialog} // Pass the hook's handleOpenDialog
            onDeleteProduct={handleDelete}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
      
      <ProductDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen} // Pass the hook's setIsDialogOpen
        editingProduct={editingProduct}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onClose={handleCloseDialog} // Pass the hook's handleCloseDialog
        categories={categories}
      />
    </Layout>
  );
};

export default Products;
