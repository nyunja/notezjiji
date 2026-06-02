import React from 'react';
import { Search, Sun, Moon, User, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationCenter from './NotificationCenter';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/60 dark:border-slate-800/60 px-4 md:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center w-full md:w-auto">
        <button 
          onClick={onMenuClick}
          className="p-2 mr-3 md:hidden rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 active:scale-95 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Search */}
        <div className="relative w-full max-w-[200px] md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search for notes, courses, or authors..." 
          className="w-full pl-12 pr-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 border border-transparent focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all"
        />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-6">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 active:scale-95 transition-all"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <NotificationCenter />
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-4 pl-4 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.full_name}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
