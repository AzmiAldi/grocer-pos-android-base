
import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  formatCurrency: (amount: number) => string;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onEditProduct, onDeleteProduct, formatCurrency }) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Price</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Stock</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.map((product) => (
            <tr key={product.id} className="bg-white">
              <td className="px-4 py-3">
                <div className="font-medium">{product.name}</div>
                <div className="text-xs text-gray-500">Barcode: {product.barcode}</div>
              </td>
              <td className="px-4 py-3 text-gray-500">{product.category}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(product.price)}</td>
              <td className="px-4 py-3 text-right">
                <span 
                  className={`px-2 py-1 rounded-full text-xs ${
                    product.stock <= product.minStock
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {product.stock} {product.unit}{product.stock !== 1 ? 's' : ''}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onEditProduct(product)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDeleteProduct(product.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
