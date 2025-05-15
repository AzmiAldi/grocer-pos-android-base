
import React from 'react';
import { CartItem, Shift } from '@/types'; // Assuming Shift type is available
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

interface PosCartPanelProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  subtotal: number;
  tax: number;
  discount: number;
  onDiscountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  total: number;
  onCheckout: () => void;
  formatCurrency: (amount: number) => string;
  currentShift: Shift | null; // Use the actual Shift type
}

const PosCartPanel: React.FC<PosCartPanelProps> = ({
  items,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  subtotal,
  tax,
  discount,
  onDiscountChange,
  total,
  onCheckout,
  formatCurrency,
  currentShift,
}) => {
  return (
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
              onClick={onClearCart}
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
                    onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <div className="w-10 text-center">{item.quantity}</div>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500"
                    onClick={() => onRemoveFromCart(item.product.id)}
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
                onChange={onDiscountChange}
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
          onClick={onCheckout}
        >
          Checkout
        </Button>
      </CardFooter>
    </div>
  );
};

export default PosCartPanel;
