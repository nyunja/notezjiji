import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Download } from 'lucide-react';
import { itemsAPI } from '../lib/api';

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
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => {
    loadItems();
  }, [selectedCourse, selectedYear, search]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await itemsAPI.getMarketplace({
        search,
        course: selectedCourse,
        year: selectedYear
      });
      setItems(response.data.data.items || []);
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

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading marketplace...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Browse Academic Notes</h2>
        {cart.length > 0 && (
          <button
            onClick={handleCheckout}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Checkout ({cart.length})</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Courses</option>
            <option value="mathematics">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
            <option value="computer-science">Computer Science</option>
            <option value="engineering">Engineering</option>
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600">No items found matching your criteria</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.course} - {item.year}</p>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(item.price)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {item.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>By {item.uploader?.full_name || 'Anonymous'}</span>
                <span>{formatFileSize(item.file_size)}</span>
              </div>

              <button
                onClick={() => toggleCart(item.id)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                  cart.includes(item.id)
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {cart.includes(item.id) ? 'Remove from Cart' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
