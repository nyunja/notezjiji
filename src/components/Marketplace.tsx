import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { itemsAPI } from '../lib/api';
import NotezCard from './NotezCard';

interface Item {
  id: string;
  title: string;
  description: string;
  course: string;
  year: string;
  price: number;
  file_size: number;
  tags: string[];
  created_at: string;
  uploader: {
    full_name: string;
  };
}

export default function Marketplace({ onPurchase }: { onPurchase: (itemIds: string[]) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cart, setCart] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadItems();
  }, [selectedCourse, selectedYear, search, sortBy]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await itemsAPI.getMarketplace({
        search,
        course: selectedCourse,
        year: selectedYear,
        sort: sortBy
      });

      let filteredItems = response.data.data.items || [];

      if (minPrice) {
        filteredItems = filteredItems.filter((item: Item) => item.price >= parseFloat(minPrice));
      }
      if (maxPrice) {
        filteredItems = filteredItems.filter((item: Item) => item.price <= parseFloat(maxPrice));
      }

      setItems(filteredItems);
    } catch (error) {
      console.error('Failed to load marketplace items:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCart = (itemId: string) => {
    setCart(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      onPurchase(cart);
    }
  };

  const clearFilters = () => {
    setSelectedCourse('');
    setSelectedYear('');
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-2">Marketplace</h2>
          <p className="text-slate-500 dark:text-slate-400">Discover premium academic materials to excel in your studies.</p>
        </div>
        
        {cart.length > 0 && (
          <button
            onClick={handleCheckout}
            className="group relative flex items-center space-x-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
          >
            <ShoppingCart className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Checkout {cart.length} Items</span>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
              {cart.length}
            </div>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by title, topic, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center space-x-2 px-6 py-4 rounded-2xl font-bold transition-all w-full md:w-auto
            ${showFilters 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50'
            }
          `}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filters</span>
        </button>

        <div className="relative w-full md:w-auto">
          <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full md:w-auto pl-10 pr-10 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-400 outline-none hover:border-indigo-500/50 appearance-none shadow-sm cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="premium-card p-6 grid md:grid-cols-4 gap-6 animate-slide-up">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="">All Courses</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
              <option value="computer-science">Computer Science</option>
              <option value="engineering">Engineering</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Price Range (₦)</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
              />
              <span className="text-slate-400">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex items-end gap-3">
            <button 
              onClick={clearFilters}
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Reset
            </button>
            <button 
              onClick={() => setShowFilters(false)}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="premium-card h-96 animate-pulse bg-slate-200 dark:bg-slate-800/50"></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Filter className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">No matching Notez</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">We couldn't find any materials matching your filters. Try broadening your search!</p>
          <button 
            onClick={clearFilters}
            className="mt-6 text-indigo-600 dark:text-indigo-400 font-black hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <NotezCard 
              key={item.id} 
              item={item} 
              isInCart={cart.includes(item.id)}
              onToggleCart={toggleCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
