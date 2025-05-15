
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { useShift } from '../contexts/ShiftContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShoppingBag, DollarSign, Package, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { databaseService } from '../services/DatabaseService';

const Dashboard = () => {
  const { user } = useAuth();
  const { products } = useProducts();
  const { currentShift } = useShift();
  const navigate = useNavigate();
  const [totalSales, setTotalSales] = useState(0);
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);
  
  useEffect(() => {
    // Calculate low stock items
    const lowStock = products.filter(p => p.stock <= p.minStock).length;
    setLowStockItems(lowStock);
    
    // Get sales data
    const sales = databaseService.getSales();
    setTotalSales(sales.reduce((sum, sale) => sum + sale.total, 0));
    setTotalSalesCount(sales.length);
  }, [products]);
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome, {user?.name}</p>
        </div>
        
        {!currentShift && (
          <Alert variant="destructive" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-600">No active shift</AlertTitle>
            <AlertDescription>
              You need to open a shift before making sales.
              <Button 
                variant="link" 
                className="text-amber-600 p-0 h-auto font-medium ml-2"
                onClick={() => navigate('/shift')}
              >
                Open shift
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-pos-primary" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">From {totalSalesCount} transactions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">In inventory</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{lowStockItems}</div>
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Items need restock</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Shift Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{currentShift ? 'Active' : 'Closed'}</div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              {currentShift ? (
                <p className="text-xs text-gray-500 mt-2">
                  Started {new Date(currentShift.startTime).toLocaleTimeString()}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-2">No active shift</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate('/pos')}
              >
                <ShoppingBag className="h-5 w-5" />
                <span>New Sale</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate('/products')}
              >
                <Package className="h-5 w-5" />
                <span>Products</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate('/receipt')}
              >
                <DollarSign className="h-5 w-5" />
                <span>Receipts</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate('/shift')}
              >
                <Clock className="h-5 w-5" />
                <span>Shift Management</span>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems === 0 ? (
                <p className="text-sm text-gray-500">No low stock items</p>
              ) : (
                <div className="space-y-2">
                  {products
                    .filter(p => p.stock <= p.minStock)
                    .slice(0, 5)
                    .map(product => (
                      <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">Category: {product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-medium">{product.stock} in stock</p>
                          <p className="text-xs text-gray-500">Min: {product.minStock}</p>
                        </div>
                      </div>
                    ))}
                  
                  {lowStockItems > 5 && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      +{lowStockItems - 5} more items need restocking
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
