
import React, { createContext, useContext, useState } from 'react';
import { CartContextType, CartItem, Product } from '../types';
import { useToast } from '@/components/ui/use-toast';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscountState] = useState(0);
  const { toast } = useToast();
  
  const addToCart = (product: Product, quantity: number) => {
    if (product.stock < quantity) {
      toast({
        title: "Insufficient stock",
        description: `Only ${product.stock} units available`,
        variant: "destructive"
      });
      return;
    }
    
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Check if we have enough stock for the additional quantity
        if (product.stock < existingItem.quantity + quantity) {
          toast({
            title: "Insufficient stock",
            description: `Only ${product.stock} units available`,
            variant: "destructive"
          });
          return currentItems;
        }
        
        return currentItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...currentItems, { product, quantity }];
      }
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to cart`
    });
  };
  
  const removeFromCart = (productId: string) => {
    setItems(items.filter(item => item.product.id !== productId));
    toast({
      title: "Item removed",
      description: "Item removed from cart"
    });
  };
  
  const updateQuantity = (productId: string, quantity: number) => {
    const item = items.find(item => item.product.id === productId);
    
    if (item && item.product.stock < quantity) {
      toast({
        title: "Insufficient stock",
        description: `Only ${item.product.stock} units available`,
        variant: "destructive"
      });
      return;
    }
    
    setItems(items.map(item => 
      item.product.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };
  
  const clearCart = () => {
    setItems([]);
    setDiscountState(0);
  };
  
  const setDiscount = (amount: number) => {
    setDiscountState(amount);
  };
  
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.0; // 0% tax rate
  const total = subtotal + tax - discount;
  
  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      tax,
      discount,
      setDiscount,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
};
