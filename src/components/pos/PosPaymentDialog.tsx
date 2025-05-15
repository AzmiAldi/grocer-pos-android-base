
import React from 'react';
import { CartItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CreditCard, Banknote } from 'lucide-react';

interface PosPaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  items: CartItem[];
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  paymentMethod: 'cash' | 'card' | 'other';
  onPaymentMethodChange: (method: 'cash' | 'card' | 'other') => void;
  cashAmount: number;
  onCashAmountChange: (amount: number) => void;
  calculateChange: () => number;
  onCompleteSale: () => void;
  formatCurrency: (amount: number) => string;
}

const PosPaymentDialog: React.FC<PosPaymentDialogProps> = ({
  isOpen,
  onOpenChange,
  totalAmount,
  items,
  customerName,
  onCustomerNameChange,
  paymentMethod,
  onPaymentMethodChange,
  cashAmount,
  onCashAmountChange,
  calculateChange,
  onCompleteSale,
  formatCurrency,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerNameDialog">Customer Name (Optional)</Label>
              <Input 
                id="customerNameDialog"
                value={customerName}
                onChange={(e) => onCustomerNameChange(e.target.value)}
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
                  onClick={() => onPaymentMethodChange('cash')}
                >
                  <Banknote className="mr-2 h-4 w-4" />
                  Cash
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => onPaymentMethodChange('card')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Card
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'other' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => onPaymentMethodChange('other')}
                >
                  <span className="mr-2">...</span>
                  Other
                </Button>
              </div>
            </div>
            
            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <Label htmlFor="cashAmountDialog">Cash Received</Label>
                <Input 
                  id="cashAmountDialog"
                  type="number"
                  min={totalAmount} // Consider if this should be 0 or totalAmount
                  step="1"
                  value={cashAmount || ''}
                  onChange={(e) => onCashAmountChange(parseFloat(e.target.value) || 0)}
                  placeholder="Enter cash amount"
                />
                
                {cashAmount > 0 && ( // Show change only if cash is entered
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
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={onCompleteSale}
            disabled={paymentMethod === 'cash' && cashAmount < totalAmount}
          >
            Complete Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PosPaymentDialog;
