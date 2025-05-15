
import { User, Product, Sale, SaleItem, Shift } from "../types";

// Simulate a local database using localStorage
class DatabaseService {
  // Authentication
  getUsers(): User[] {
    const users = localStorage.getItem('pos_users');
    if (users) {
      return JSON.parse(users);
    }
    // Create default admin user if no users exist
    const defaultUsers: User[] = [
      { 
        id: '1', 
        username: 'admin', 
        password: 'admin123', // In a real app, this would be hashed
        name: 'Admin User',
        role: 'admin'
      },
      { 
        id: '2', 
        username: 'cashier', 
        password: 'cashier123', 
        name: 'Cashier User',
        role: 'cashier'
      },
    ];
    localStorage.setItem('pos_users', JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  validateUser(username: string, password: string): User | null {
    const users = this.getUsers();
    const user = users.find(user => user.username === username && user.password === password);
    return user || null;
  }

  // Products
  getProducts(): Product[] {
    const products = localStorage.getItem('pos_products');
    if (products) {
      return JSON.parse(products);
    }
    
    // Create sample products if none exist
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Milk',
        barcode: '8901234567890',
        category: 'Dairy',
        price: 2.99,
        costPrice: 1.99,
        stock: 50,
        minStock: 10,
        unit: 'bottle',
        imageUrl: ''
      },
      {
        id: '2',
        name: 'Bread',
        barcode: '7890123456789',
        category: 'Bakery',
        price: 1.99,
        costPrice: 0.99,
        stock: 30,
        minStock: 5,
        unit: 'loaf',
        imageUrl: ''
      },
      {
        id: '3',
        name: 'Eggs',
        barcode: '6789012345678',
        category: 'Dairy',
        price: 3.49,
        costPrice: 2.49,
        stock: 40,
        minStock: 8,
        unit: 'dozen',
        imageUrl: ''
      },
      {
        id: '4',
        name: 'Cheese',
        barcode: '5678901234567',
        category: 'Dairy',
        price: 4.99,
        costPrice: 3.49,
        stock: 25,
        minStock: 5,
        unit: 'pack',
        imageUrl: ''
      },
      {
        id: '5',
        name: 'Apple',
        barcode: '4567890123456',
        category: 'Fruits',
        price: 0.99,
        costPrice: 0.49,
        stock: 100,
        minStock: 20,
        unit: 'piece',
        imageUrl: ''
      },
    ];
    
    localStorage.setItem('pos_products', JSON.stringify(sampleProducts));
    return sampleProducts;
  }

  addProduct(product: Product): Product {
    const products = this.getProducts();
    // Generate a new ID
    const newId = (Math.max(...products.map(p => parseInt(p.id)), 0) + 1).toString();
    const newProduct = { ...product, id: newId };
    products.push(newProduct);
    localStorage.setItem('pos_products', JSON.stringify(products));
    return newProduct;
  }

  updateProduct(product: Product): Product {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      products[index] = product;
      localStorage.setItem('pos_products', JSON.stringify(products));
    }
    return product;
  }

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    if (filteredProducts.length < products.length) {
      localStorage.setItem('pos_products', JSON.stringify(filteredProducts));
      return true;
    }
    return false;
  }

  updateStock(id: string, quantity: number): boolean {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index].stock += quantity;
      localStorage.setItem('pos_products', JSON.stringify(products));
      return true;
    }
    return false;
  }

  // Sales
  getSales(): Sale[] {
    const sales = localStorage.getItem('pos_sales');
    return sales ? JSON.parse(sales) : [];
  }

  addSale(sale: Omit<Sale, "id">): Sale {
    const sales = this.getSales();
    const newId = (Math.max(...sales.map(s => parseInt(s.id)), 0) + 1).toString();
    const newSale = { ...sale, id: newId };
    sales.push(newSale);
    localStorage.setItem('pos_sales', JSON.stringify(sales));
    
    // Update product stock
    sale.items.forEach(item => {
      this.updateStock(item.productId, -item.quantity);
    });
    
    return newSale;
  }

  // Shifts
  getShifts(): Shift[] {
    const shifts = localStorage.getItem('pos_shifts');
    return shifts ? JSON.parse(shifts) : [];
  }

  getCurrentShift(): Shift | null {
    const shifts = this.getShifts();
    const openShift = shifts.find(shift => !shift.endTime);
    return openShift || null;
  }

  openShift(userId: string, openingBalance: number): Shift {
    const shifts = this.getShifts();
    const newId = (Math.max(...shifts.map(s => parseInt(s.id)), 0) + 1).toString();
    const newShift: Shift = {
      id: newId,
      userId,
      startTime: new Date().toISOString(),
      endTime: null,
      openingBalance,
      closingBalance: null,
      sales: [],
      status: 'open'
    };
    shifts.push(newShift);
    localStorage.setItem('pos_shifts', JSON.stringify(shifts));
    return newShift;
  }

  closeShift(shiftId: string, closingBalance: number): Shift | null {
    const shifts = this.getShifts();
    const index = shifts.findIndex(s => s.id === shiftId);
    if (index !== -1) {
      shifts[index].endTime = new Date().toISOString();
      shifts[index].closingBalance = closingBalance;
      shifts[index].status = 'closed';
      
      // Get sales for this shift
      const sales = this.getSales().filter(sale => 
        sale.shiftId === shiftId
      );
      shifts[index].sales = sales.map(s => s.id);
      
      localStorage.setItem('pos_shifts', JSON.stringify(shifts));
      return shifts[index];
    }
    return null;
  }
}

export const databaseService = new DatabaseService();
