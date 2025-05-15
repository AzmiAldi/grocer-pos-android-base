
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface NoProductsFoundProps {
  searchTerm: string;
  onClearSearch: () => void;
}

const NoProductsFound: React.FC<NoProductsFoundProps> = ({ searchTerm, onClearSearch }) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
        <h3 className="font-semibold text-xl">No products found</h3>
        {searchTerm ? (
          <p className="text-gray-500 mt-1">Try changing your search term</p>
        ) : (
          <p className="text-gray-500 mt-1">Add your first product to get started</p>
        )}
        {searchTerm && (
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={onClearSearch}
          >
            <X className="mr-2 h-4 w-4" />
            Clear search
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default NoProductsFound;
