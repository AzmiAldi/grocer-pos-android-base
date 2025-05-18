export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'cashier' | 'manager';
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  imageUrl: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  name: string;
}

export interface Sale {
  id: string;
  timestamp: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'other';
  cashierId: string;
  shiftId: string;
  customerName?: string;
  cashTendered?: number; // Added for cash payments
  change?: number;       // Added for change given
}

export interface Shift {
  id: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  openingBalance: number;
  closingBalance: number | null;
  sales: string[];
  status: 'open' | 'closed';
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: Error | null;
  addProduct: (product: Omit<Product, "id">) => Promise<Product>;
  updateProduct: (product: Product) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  refreshProducts: () => void;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  setDiscount: (amount: number) => void;
}

export interface ShiftContextType {
  currentShift: Shift | null;
  loading: boolean;
  openShift: (openingBalance: number) => Promise<Shift>;
  closeShift: (closingBalance: number) => Promise<Shift | null>;
  refreshShift: () => void;
}
