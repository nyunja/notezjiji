import React from 'react';
import { ShoppingCart, FileText, User, Star } from 'lucide-react';

interface Item {
  id: string;
  title: string;
  description: string;
  course: string;
  year: string;
  price: number;
  file_size: number;
  tags: string[];
  uploader: {
    full_name: string;
  };
}

interface NotezCardProps {
  item: Item;
  isInCart: boolean;
  onToggleCart: (id: string) => void;
}

const NotezCard: React.FC<NotezCardProps> = ({ item, isInCart, onToggleCart }) => {
  const formatPrice = (price: number) => `Ksh ${price.toLocaleString()}`;
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="premium-card flex flex-col h-full group">
      {/* Card Header/Thumbnail Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/20 dark:to-violet-900/20 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="w-16 h-16 text-indigo-400/50 group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="absolute top-4 left-4 flex space-x-2">
          <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full shadow-sm">
            {item.course}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100/90 dark:bg-amber-900/90 backdrop-blur-md rounded-full">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">4.8</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h3>
        </div>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
          {item.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {item.tags.slice(0, 3).map((tag, idx) => (
            <span 
              key={idx} 
              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-md uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between py-4 border-t border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Author</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.uploader?.full_name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Size</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatFileSize(item.file_size)}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-none">Price</span>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{formatPrice(item.price)}</span>
          </div>
          <button
            onClick={() => onToggleCart(item.id)}
            className={`
              flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold transition-all duration-300
              ${isInCart 
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
              }
            `}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isInCart ? 'Remove' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotezCard;
