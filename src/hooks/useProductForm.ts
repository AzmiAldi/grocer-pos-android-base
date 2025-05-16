
import { useState, useCallback } from 'react';
import { Product } from '@/types';

interface UseProductFormProps {
  addProduct: (product: Omit<Product, "id">) => Promise<Product>;
  updateProduct: (product: Product) => Promise<Product>;
}

const initialFormData: Omit<Product, "id"> = {
  name: '',
  barcode: '',
  category: '',
  price: 0,
  costPrice: 0,
  stock: 0,
  minStock: 0,
  unit: 'piece',
  imageUrl: ''
};

export const useProductForm = ({ addProduct, updateProduct }: UseProductFormProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, "id">>(initialFormData);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setEditingProduct(null);
  }, []);

  const handleOpenDialog = useCallback((product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  }, [resetForm]);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    resetForm();
  }, [resetForm]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
      // Optionally, you could add a toast notification here for the error
    }
  }, [editingProduct, formData, addProduct, updateProduct, handleCloseDialog]);

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingProduct,
    formData,
    handleOpenDialog,
    handleCloseDialog,
    handleInputChange,
    handleSubmit,
  };
};
