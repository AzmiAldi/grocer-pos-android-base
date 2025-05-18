import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Sale } from '../types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { databaseService } from '../services/DatabaseService';
import { useAuth } from '../contexts/AuthContext';
import { Search, Printer, ArrowLeft, Calendar, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

const Receipt = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Fetch all sales
    const allSales = databaseService.getSales();
    setSales(allSales.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
    
    // Check if we have a last sale in sessionStorage
    const lastSaleStr = sessionStorage.getItem('lastSale');
    if (lastSaleStr) {
      const lastSale = JSON.parse(lastSaleStr);
      setSelectedSale(lastSale);
      // Remove from session storage
      sessionStorage.removeItem('lastSale');
    }
  }, []);
  
  const handleSelectSale = (sale: Sale) => {
    setSelectedSale(sale);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const getFormattedDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  const getFormattedTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const filteredSales = sales.filter(sale => {
    if (!searchTerm) return true;
    
    // Search by customer name or sale ID
    return (
      sale.id.includes(searchTerm) || 
      (sale.customerName && sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  return (
    <Layout>
      <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col md:flex-row gap-4">
        {/* Sales list */}
        <div className="flex flex-col md:w-2/5 overflow-hidden">
          <div className="bg-white border rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold mb-4">Sales History</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search receipts..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Tabs defaultValue="all">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="all">All Receipts</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="m-0">
                {filteredSales.length > 0 ? (
                  <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-22rem)]">
                    {filteredSales.map(sale => (
                      <div 
                        key={sale.id} 
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedSale?.id === sale.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleSelectSale(sale)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">Receipt #{sale.id}</div>
                            <div className="text-xs text-gray-500">
                              {sale.customerName ? sale.customerName : 'Walk-in Customer'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(sale.total)}</div>
                            <div className="text-xs text-gray-500">{getFormattedDate(sale.timestamp)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No matching receipts found' : 'No sales records yet'}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="today" className="m-0">
                {filteredSales
                  .filter(sale => {
                    const today = new Date();
                    const saleDate = new Date(sale.timestamp);
                    return (
                      saleDate.getDate() === today.getDate() &&
                      saleDate.getMonth() === today.getMonth() &&
                      saleDate.getFullYear() === today.getFullYear()
                    );
                  })
                  .length > 0 ? (
                  <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-22rem)]">
                    {filteredSales
                      .filter(sale => {
                        const today = new Date();
                        const saleDate = new Date(sale.timestamp);
                        return (
                          saleDate.getDate() === today.getDate() &&
                          saleDate.getMonth() === today.getMonth() &&
                          saleDate.getFullYear() === today.getFullYear()
                        );
                      })
                      .map(sale => (
                        <div 
                          key={sale.id} 
                          className={`p-3 border rounded-md cursor-pointer transition-colors ${
                            selectedSale?.id === sale.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelectSale(sale)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">Receipt #{sale.id}</div>
                              <div className="text-xs text-gray-500">
                                {sale.customerName ? sale.customerName : 'Walk-in Customer'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{formatCurrency(sale.total)}</div>
                              <div className="text-xs text-gray-500">{getFormattedTime(sale.timestamp)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No sales records for today
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="mt-auto">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/pos')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to POS
            </Button>
          </div>
        </div>
        
        {/* Receipt Preview */}
        <div className="flex flex-col md:w-3/5 bg-white border rounded-lg overflow-hidden">
          {selectedSale ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Receipt #{selectedSale.id}</h2>
                <Button onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-md mx-auto p-4 border rounded-md" id="receipt-container">
                  <div className="text-center mb-4">
                    <h1 className="text-xl font-bold">Stello Coffee</h1>
                    <p className="text-sm">123 Main Street, City</p>
                    <p className="text-sm">Tel: (123) 456-7890</p>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-4">
                    <div>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-3 w-3" />
                        <span>{getFormattedDate(selectedSale.timestamp)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-3 w-3" />
                        <span>{getFormattedTime(selectedSale.timestamp)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div>Receipt #: {selectedSale.id}</div>
                      <div>Cashier: {user?.name || 'Unknown'}</div>
                    </div>
                  </div>
                  
                  {selectedSale.customerName && (
                    <div className="mb-4 p-2 bg-gray-50 rounded-md text-sm">
                      <strong>Customer:</strong> {selectedSale.customerName}
                    </div>
                  )}
                  
                  <div className="border-t border-b py-2 mb-4">
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="w-5/12">Item</span>
                      <span className="w-2/12 text-right">Price</span>
                      <span className="w-2/12 text-right">Qty</span>
                      <span className="w-3/12 text-right">Total</span>
                    </div>
                    
                    {selectedSale.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm py-1">
                        <span className="w-5/12 truncate">{item.name}</span>
                        <span className="w-2/12 text-right">{formatCurrency(item.unitPrice)}</span>
                        <span className="w-2/12 text-right">{item.quantity}</span>
                        <span className="w-3/12 text-right">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedSale.subtotal)}</span>
                    </div>
                    {selectedSale.paymentMethod === 'cash' && typeof selectedSale.cashTendered === 'number' && (
                      <div className="flex justify-between text-sm">
                        <span>Cash Tendered:</span>
                        <span>{formatCurrency(selectedSale.cashTendered)}</span>
                      </div>
                    )}
                    {selectedSale.paymentMethod === 'cash' && typeof selectedSale.change === 'number' && selectedSale.change > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Change:</span>
                        <span>{formatCurrency(selectedSale.change)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>{formatCurrency(selectedSale.tax)}</span>
                    </div>
                    {selectedSale.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Discount:</span>
                        <span>-{formatCurrency(selectedSale.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedSale.total)}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4 p-2 bg-gray-50 rounded-md text-sm">
                    <strong>Payment Method:</strong> {selectedSale.paymentMethod === 'cash' ? 'Cash' : selectedSale.paymentMethod === 'card' ? 'Card' : 'Other'}
                  </div>
                  
                  <div className="text-center text-sm mt-6 pt-4 border-t">
                    <p>Thank you for shopping with us!</p>
                    <p>Please keep this receipt for any returns</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Printer className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold">No Receipt Selected</h3>
              <p className="text-gray-500 max-w-sm">
                Select a receipt from the list to view and print it
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Receipt;
