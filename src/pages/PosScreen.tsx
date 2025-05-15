import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useShift } from '../contexts/ShiftContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { databaseService } from '../services/DatabaseService';
import { useIsMobile } from '@/hooks/use-mobile';
import { Label } from '@/components/ui/label';
import { Sale } from '../types';
import { formatCurrency } from '@/utils/formatCurrency';
import PosProductSelectionArea from '@/components/pos/PosProductSelectionArea';
import PosCartPanel from '@/components/pos/PosCartPanel';
import PosPaymentDialog from '@/components/pos/PosPaymentDialog';

const PosScreen = () => {
  const { products } = useProducts();
  const { items, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, tax, total, discount, setDiscount } = useCart();
  const { currentShift } = useShift();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'other'>('cash');
  
  const categories = [...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.barcode.includes(searchTerm);
    
    const matchesCategory = selectedCategory === null || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }
    
    if (!currentShift) {
      alert('Please open a shift before making sales');
      navigate('/shift');
      return;
    }
    
    setPaymentDialogOpen(true);
  };
  
  const handleCompleteSale = () => {
    if (!user || !currentShift) return;
    
    const saleItems = items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.product.price,
      total: item.product.price * item.quantity,
      name: item.product.name
    }));
    
    const sale: Omit<Sale, "id"> = {
      timestamp: new Date().toISOString(),
      items: saleItems,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      cashierId: user.id,
      shiftId: currentShift.id,
      customerName: customerName || undefined
    };
    
    const newSale = databaseService.addSale(sale);
    
    sessionStorage.setItem('lastSale', JSON.stringify(newSale));
    
    clearCart();
    setPaymentDialogOpen(false);
    setCashAmount(0);
    setCustomerName('');
    setDiscount(0);
    
    navigate('/receipt');
  };
  
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setDiscount(isNaN(value) ? 0 : value);
  };
  
  const calculateChange = () => {
    return cashAmount > total ? cashAmount - total : 0;
  };
  
  return (
    <Layout>
      <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col md:flex-row gap-4">
        <PosProductSelectionArea
          products={filteredProducts}
          allProducts={products}
          categories={categories}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onSelectedCategoryChange={setSelectedCategory}
          onAddToCart={addToCart}
          currentShift={currentShift}
          formatCurrency={formatCurrency}
          onOpenShiftNavigate={() => navigate('/shift')}
        />
        
        <PosCartPanel
          items={items}
          onUpdateQuantity={updateQuantity}
          onRemoveFromCart={removeFromCart}
          onClearCart={clearCart}
          subtotal={subtotal}
          tax={tax}
          discount={discount}
          onDiscountChange={handleDiscountChange}
          total={total}
          onCheckout={handleCheckout}
          formatCurrency={formatCurrency}
          currentShift={currentShift}
        />
      </div>
      
      <PosPaymentDialog
        isOpen={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        totalAmount={total}
        items={items}
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        cashAmount={cashAmount}
        onCashAmountChange={setCashAmount}
        calculateChange={calculateChange}
        onCompleteSale={handleCompleteSale}
        formatCurrency={formatCurrency}
      />
    </Layout>
  );
};

export default PosScreen;
