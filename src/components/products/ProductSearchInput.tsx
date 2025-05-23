
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProductSearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductSearchInput: React.FC<ProductSearchInputProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input 
        placeholder="Search products by name, category or barcode..." 
        className="pl-10"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default ProductSearchInput;
