import React from 'react';
import { 
  Home, 
  ShoppingCart, 
  Upload, 
  DollarSign, 
  Shield, 
  CheckSquare, 
  Wallet, 
  Users, 
  FileText, 
  User as UserIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'purchases', label: 'My Purchases', icon: FileText },
  ];

  const uploaderItems = [
    { id: 'upload', label: 'Upload Notes', icon: Upload },
    { id: 'dashboard', label: 'Earnings', icon: DollarSign },
  ];

  const adminItems = [
    { id: 'admin-dashboard', label: 'Overview', icon: Shield },
    { id: 'admin-items', label: 'Item Approval', icon: CheckSquare },
    { id: 'admin-payouts', label: 'Payouts', icon: Wallet },
    { id: 'admin-users', label: 'User Management', icon: Users },
  ];

  const NavItem = ({ item, color = 'indigo' }: { item: any, color?: string }) => {
    const isActive = currentView === item.id;
    return (
      <button
        onClick={() => setCurrentView(item.id)}
        className={`
          w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group
          ${isActive 
            ? `bg-${color}-600 text-white shadow-lg shadow-${color}-500/30` 
            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
          }
        `}
      >
        <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`} />
        {isOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
      </button>
    );
  };

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-[100dvh] glass z-50 transition-all duration-500 ease-in-out
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'}
      `}
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Notezjiji
            </span>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>

          {user?.role === 'uploader' && (
            <div className="space-y-1">
              {isOpen && <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Uploader</p>}
              {uploaderItems.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </div>
          )}

          {user?.role === 'admin' && (
            <div className="space-y-1">
              {isOpen && <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Administration</p>}
              {adminItems.map((item) => (
                <NavItem key={item.id} item={item} color="rose" />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <NavItem item={{ id: 'profile', label: 'My Profile', icon: UserIcon }} />
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-indigo-600 text-white rounded-full hidden md:flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
