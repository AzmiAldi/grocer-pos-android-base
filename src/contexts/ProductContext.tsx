
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductContextType } from '../types';
import { databaseService } from '../services/DatabaseService';
import { useToast } from '@/components/ui/use-toast';

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = databaseService.getProducts();
      setProducts(fetchedProducts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      toast({
        title: "Error fetching products",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const addProduct = async (product: Omit<Product, "id">): Promise<Product> => {
    try {
      const newProduct = databaseService.addProduct(product as Product);
      setProducts([...products, newProduct]);
      toast({
        title: "Product added",
        description: `${newProduct.name} has been added to inventory`,
      });
      return newProduct;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add product');
      setError(error);
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const updateProduct = async (product: Product): Promise<Product> => {
    try {
      const updatedProduct = databaseService.updateProduct(product);
      setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
      toast({
        title: "Product updated",
        description: `${updatedProduct.name} has been updated`,
      });
      return updatedProduct;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update product');
      setError(error);
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const success = databaseService.deleteProduct(id);
      if (success) {
        setProducts(products.filter(p => p.id !== id));
        toast({
          title: "Product deleted",
          description: "Product has been removed from inventory",
        });
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete product');
      setError(error);
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  return (
    <ProductContext.Provider value={{ 
      products, 
      loading, 
      error,
      addProduct,
      updateProduct,
      deleteProduct,
      refreshProducts: fetchProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};
