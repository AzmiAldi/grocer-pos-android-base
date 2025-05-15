
import React from 'react';
import { Product } from '@/types';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, AlertTriangle, Clock } from 'lucide-react';

interface PosProductSelectionAreaProps {
  products: Product[]; // These are already filtered products
  allProducts: Product[]; // To derive categories if needed, or pass categories directly
  categories: string[];
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedCategory: string | null;
  onSelectedCategoryChange: (category: string | null) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  currentShift: any; // Replace 'any' with Shift type from '@/types'
  formatCurrency: (amount: number) => string;
  onOpenShiftNavigate: () => void;
}

const PosProductSelectionArea: React.FC<PosProductSelectionAreaProps> = ({
  products,
  // allProducts, // Not strictly needed if categories are passed directly
  categories,
  searchTerm,
  onSearchTermChange,
  selectedCategory,
  onSelectedCategoryChange,
  onAddToCart,
  currentShift,
  formatCurrency,
  onOpenShiftNavigate,
}) => {
  return (
    <div className="flex flex-col md:w-3/5 overflow-hidden">
      <div className="p-2 bg-white border rounded-lg mb-4">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search products by name or scan barcode..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs 
            defaultValue="all" 
            value={selectedCategory || "all"} 
            onValueChange={(value) => onSelectedCategoryChange(value === "all" ? null : value)}
            className="w-full"
        >
          <TabsList className="w-full h-auto flex flex-wrap">
            <TabsTrigger value="all">
              All
            </TabsTrigger>
            {categories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
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
            <Button onClick={onOpenShiftNavigate}>Open Shift</Button>
          </div>
        )}
        
        {currentShift && products.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold">No products found</h3>
            <p className="text-gray-500">Try a different search term or category</p>
          </div>
        )}
        
        {currentShift && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map(product => (
              <Card 
                key={product.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  product.stock <= 0 ? 'opacity-50' : ''
                }`}
                onClick={() => product.stock > 0 && onAddToCart(product, 1)}
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
  );
};

export default PosProductSelectionArea;
