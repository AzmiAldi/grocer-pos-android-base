
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useShift } from '../contexts/ShiftContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Clock, DollarSign, ShoppingBag, ArrowRight } from 'lucide-react';
import { databaseService } from '../services/DatabaseService';
import { Sale } from '../types';

const ShiftManagement = () => {
  const { currentShift, openShift, closeShift } = useShift();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [openDialogVisible, setOpenDialogVisible] = useState(false);
  const [closeDialogVisible, setCloseDialogVisible] = useState(false);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [shiftSales, setShiftSales] = useState<Sale[]>([]);
  
  useEffect(() => {
    if (currentShift) {
      // Get all sales for current shift
      const allSales = databaseService.getSales();
      const sales = allSales.filter(sale => sale.shiftId === currentShift.id);
      setShiftSales(sales);
      
      // Set expected closing balance based on sales
      const totalCashSales = sales
        .filter(sale => sale.paymentMethod === 'cash')
        .reduce((sum, sale) => sum + sale.total, 0);
      setClosingBalance(currentShift.openingBalance + totalCashSales);
    }
  }, [currentShift]);
  
  const handleOpenShift = async () => {
    try {
      await openShift(openingBalance);
      setOpenDialogVisible(false);
    } catch (error) {
      console.error('Error opening shift:', error);
    }
  };
  
  const handleCloseShift = async () => {
    try {
      await closeShift(closingBalance);
      setCloseDialogVisible(false);
    } catch (error) {
      console.error('Error closing shift:', error);
    }
  };
  
  const calculateTotalSales = () => {
    return shiftSales.reduce((sum, sale) => sum + sale.total, 0);
  };
  
  const calculateCashSales = () => {
    return shiftSales
      .filter(sale => sale.paymentMethod === 'cash')
      .reduce((sum, sale) => sum + sale.total, 0);
  };
  
  const calculateCardSales = () => {
    return shiftSales
      .filter(sale => sale.paymentMethod === 'card')
      .reduce((sum, sale) => sum + sale.total, 0);
  };
  
  const calculateOtherSales = () => {
    return shiftSales
      .filter(sale => sale.paymentMethod === 'other')
      .reduce((sum, sale) => sum + sale.total, 0);
  };
  
  const getFormattedDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Shift Management</h1>
            <p className="text-gray-500">Open, close and manage shifts</p>
          </div>
          
          {!currentShift ? (
            <Button onClick={() => setOpenDialogVisible(true)}>
              <Clock className="mr-2 h-4 w-4" />
              Open New Shift
            </Button>
          ) : (
            <Button 
              variant="destructive"
              onClick={() => setCloseDialogVisible(true)}
            >
              <Clock className="mr-2 h-4 w-4" />
              Close Shift
            </Button>
          )}
        </div>
        
        {currentShift ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Current Shift Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="text-sm text-gray-500">Opened By</div>
                    <div className="font-medium">{user?.name}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="text-sm text-gray-500">Opening Time</div>
                    <div className="font-medium">{getFormattedDateTime(currentShift.startTime)}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="text-sm text-gray-500">Shift ID</div>
                    <div className="font-medium">{currentShift.id}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="text-sm text-gray-500">Opening Balance</div>
                    <div className="font-medium">${currentShift.openingBalance.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500">Total Sales</div>
                          <div className="text-xl font-bold">${calculateTotalSales().toFixed(2)}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">{shiftSales.length} transactions</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500">Cash Sales</div>
                          <div className="text-xl font-bold">${calculateCashSales().toFixed(2)}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {shiftSales.filter(s => s.paymentMethod === 'cash').length} cash transactions
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500">Card/Other Sales</div>
                          <div className="text-xl font-bold">
                            ${(calculateCardSales() + calculateOtherSales()).toFixed(2)}
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <ArrowRight className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {shiftSales.filter(s => s.paymentMethod !== 'cash').length} non-cash transactions
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Recent Transactions</h3>
                  
                  {shiftSales.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">Receipt #</th>
                            <th className="px-4 py-2 text-left">Time</th>
                            <th className="px-4 py-2 text-left">Payment</th>
                            <th className="px-4 py-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {shiftSales.slice(0, 5).map((sale) => (
                            <tr key={sale.id}>
                              <td className="px-4 py-2">{sale.id}</td>
                              <td className="px-4 py-2">
                                {new Date(sale.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="px-4 py-2 capitalize">{sale.paymentMethod}</td>
                              <td className="px-4 py-2 text-right">${sale.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-md bg-gray-50">
                      <p className="text-gray-500">No transactions yet in this shift</p>
                      <Button 
                        variant="link" 
                        className="mt-2"
                        onClick={() => navigate('/pos')}
                      >
                        Go to POS Screen
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Active Shift</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                You need to open a shift before making any sales. 
                Opening a shift allows you to track all transactions and manage your cash drawer.
              </p>
              <Button onClick={() => setOpenDialogVisible(true)}>
                Open New Shift
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Open Shift Dialog */}
      <Dialog open={openDialogVisible} onOpenChange={setOpenDialogVisible}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Open New Shift</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openingBalance">Opening Cash Balance ($)</Label>
                <Input
                  id="openingBalance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                />
                <p className="text-sm text-gray-500">
                  Enter the amount of cash in the drawer at the start of the shift
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialogVisible(false)}>
              Cancel
            </Button>
            <Button onClick={handleOpenShift}>
              Open Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Close Shift Dialog */}
      <Dialog open={closeDialogVisible} onOpenChange={setCloseDialogVisible}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Close Shift</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-700">
                  Make sure all sales are finalized before closing this shift. 
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="closingBalance">Closing Cash Balance ($)</Label>
                <Input
                  id="closingBalance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={closingBalance}
                  onChange={(e) => setClosingBalance(parseFloat(e.target.value) || 0)}
                />
                <p className="text-sm text-gray-500">
                  Enter the actual amount of cash in the drawer at the end of the shift
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between text-sm">
                  <span>Opening Balance:</span>
                  <span>${currentShift?.openingBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cash Sales:</span>
                  <span>${calculateCashSales().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium pt-2 mt-2 border-t">
                  <span>Expected Closing:</span>
                  <span>${(currentShift?.openingBalance + calculateCashSales()).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseDialogVisible(false)}>
              Cancel
            </Button>
            <Button onClick={handleCloseShift}>
              Close Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ShiftManagement;
