import { X, User, Calendar, Tag } from 'lucide-react';

interface ItemPreviewModalProps {
  item: {
    id: string;
    title: string;
    description: string;
    course: string;
    year: string;
    price: number;
    file_size: number;
    tags: string[];
    view_count: number;
    purchase_count: number;
    created_at: string;
    uploader: {
      full_name: string;
    };
  };
  onClose: () => void;
  onAddToCart?: (itemId: string) => void;
  onPurchase?: (itemId: string) => void;
}

export default function ItemPreviewModal({ item, onClose, onAddToCart, onPurchase }: ItemPreviewModalProps) {
  const formatPrice = (price: number) => `Ksh ${price.toLocaleString()}`;
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Item Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Tag className="w-4 h-4" />
                  <span>{item.course}</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{item.year}</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{item.uploader.full_name}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Price</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 mb-1">File Size</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatFileSize(item.file_size)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {item.tags.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{item.view_count || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Views</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{item.purchase_count || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Purchases</p>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>
                Listed on{' '}
                {new Date(item.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            {onAddToCart && (
              <button
                onClick={() => {
                  onAddToCart(item.id);
                  onClose();
                }}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Add to Cart
              </button>
            )}
            {onPurchase && (
              <button
                onClick={() => {
                  onPurchase(item.id);
                  onClose();
                }}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Buy Now
              </button>
            )}
            {!onAddToCart && !onPurchase && (
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
