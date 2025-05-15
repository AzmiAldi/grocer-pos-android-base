
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

// Helper function to format currency in Indonesian Rupiah
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const PosScreen = () => {
  const { products } = useProducts();
  const { items, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, tax, total, discount, setDiscount } = useCart();
  const { currentShift } = useShift();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
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
    
    // Save the last sale to sessionStorage for receipt printing
    sessionStorage.setItem('lastSale', JSON.stringify(newSale));
    
    // Reset
    clearCart();
    setPaymentDialogOpen(false);
    setCashAmount(0);
    setCustomerName('');
    
    // Navigate to receipt
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
        {/* Products section */}
        <div className="flex flex-col md:w-3/5 overflow-hidden">
          <div className="p-2 bg-white border rounded-lg mb-4">
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search products by name or scan barcode..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full h-auto flex flex-wrap">
                <TabsTrigger value="all" onClick={() => setSelectedCategory(null)}>
                  All
                </TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-white border rounded-lg p-4">
            {!currentShift && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Active Shift</h3>
                <p className="text-gray-500 mb-4">You need to open a shift before making sales</p>
                <Button onClick={() => navigate('/shift')}>Open Shift</Button>
              </div>
            )}
            
            {currentShift && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold">No products found</h3>
                <p className="text-gray-500">Try a different search term</p>
              </div>
            )}
            
            {currentShift && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProducts.map(product => (
                  <Card 
                    key={product.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      product.stock <= 0 ? 'opacity-50' : ''
                    }`}
                    onClick={() => product.stock > 0 && addToCart(product, 1)}
                  >
                    <CardContent className="p-3">
                      <div className="text-center">
                        <div className="font-medium truncate">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate">{product.category}</div>
                        <div className="font-bold mt-1">{formatCurrency(product.price)}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {product.stock > 0 ? (
                            <span>{product.stock} in stock</span>
                          ) : (
                            <span className="text-red-500">Out of stock</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Cart section */}
        <div className="flex flex-col md:w-2/5 bg-white border rounded-lg overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Cart
              </div>
              {items.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700"
                >
                  Clear Cart
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <ShoppingCart className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold">Cart is empty</h3>
                <p className="text-gray-500">Add products to begin a sale</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(item.product.price)} each</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <div className="w-10 text-center">{item.quantity}</div>
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex-col border-t p-4">
            <div className="w-full space-y-1 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (10%):</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Discount:</span>
                <div className="flex items-center gap-2">
                  <span>Rp</span>
                  <Input 
                    type="number"
                    min="0"
                    step="1"
                    value={discount}
                    onChange={handleDiscountChange}
                    className="w-20 h-8 text-right"
                  />
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              size="lg"
              disabled={items.length === 0 || !currentShift}
              onClick={handleCheckout}
            >
              Checkout
            </Button>
          </CardFooter>
        </div>
      </div>
      
      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Customer Name (Optional)</Label>
                <Input 
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <Label>Payment Method</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button
                    type="button"
                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <Banknote className="mr-2 h-4 w-4" />
                    Cash
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Card
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === 'other' ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setPaymentMethod('other')}
                  >
                    <span className="mr-2">...</span>
                    Other
                  </Button>
                </div>
              </div>
              
              {paymentMethod === 'cash' && (
                <div className="space-y-2">
                  <Label htmlFor="cashAmount">Cash Received</Label>
                  <Input 
                    id="cashAmount"
                    type="number"
                    min={total}
                    step="1"
                    value={cashAmount || ''}
                    onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter cash amount"
                  />
                  
                  {cashAmount > 0 && (
                    <div className="flex justify-between font-medium mt-2 p-2 bg-gray-50 rounded-md">
                      <span>Change:</span>
                      <span>{formatCurrency(calculateChange())}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="rounded-md bg-gray-50 p-3">
                <div className="text-sm font-medium">Order Summary</div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm">Items:</span>
                  <span className="text-sm">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Quantity:</span>
                  <span className="text-sm">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between font-bold mt-1">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteSale}
              disabled={paymentMethod === 'cash' && cashAmount < total}
            >
              Complete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default PosScreen;
