
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useShift } from '../contexts/ShiftContext';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  FileText, 
  Clock, 
  LogOut,
  Menu,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive, onClick }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
      isActive 
        ? 'bg-pos-primary text-white' 
        : 'hover:bg-pos-accent hover:text-pos-primary'
    }`}
    onClick={onClick}
  >
    <div className="w-5 h-5">{icon}</div>
    <span>{label}</span>
  </Link>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { currentShift } = useShift();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { path: '/products', label: 'Products', icon: <Package size={18} /> },
    { path: '/pos', label: 'POS', icon: <ShoppingCart size={18} /> },
    { path: '/receipt', label: 'Receipts', icon: <FileText size={18} /> },
    { path: '/shift', label: 'Shift', icon: <Clock size={18} /> },
  ];
  
  const renderNavigation = () => (
    <div className="space-y-2">
      {navItems.map((item) => (
        <NavItem
          key={item.path}
          to={item.path}
          icon={item.icon}
          label={item.label}
          isActive={location.pathname === item.path}
          onClick={isMobile ? closeMenu : undefined}
        />
      ))}
    </div>
  );
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      {!isMobile && (
        <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-pos-primary">Grocery POS</h1>
            {currentShift && <p className="text-sm text-green-500 mt-1">Shift Open</p>}
            {!currentShift && <p className="text-sm text-red-500 mt-1">No Shift Open</p>}
          </div>
          
          <nav className="flex-1">
            {renderNavigation()}
          </nav>
          
          <div className="mt-auto border-t pt-4">
            {user && (
              <div className="flex items-center gap-3 mb-4 px-3">
                <div className="w-8 h-8 bg-pos-primary rounded-full flex items-center justify-center text-white">
                  <User size={16} />
                </div>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            )}
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile header */}
        {isMobile && (
          <header className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] p-0">
                <div className="p-4 border-b">
                  <h1 className="text-xl font-bold text-pos-primary">Grocery POS</h1>
                  {currentShift && <p className="text-sm text-green-500 mt-1">Shift Open</p>}
                  {!currentShift && <p className="text-sm text-red-500 mt-1">No Shift Open</p>}
                </div>
                
                <div className="p-4">
                  <nav className="space-y-2">
                    {renderNavigation()}
                  </nav>
                  
                  <div className="mt-8 pt-4 border-t">
                    {user && (
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-pos-primary rounded-full flex items-center justify-center text-white">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                      </div>
                    )}
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <h1 className="text-lg font-bold text-pos-primary">Grocery POS</h1>
            
            {currentShift ? (
              <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full">
                Shift Open
              </span>
            ) : (
              <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">
                No Shift
              </span>
            )}
          </header>
        )}
        
        {/* Page content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
