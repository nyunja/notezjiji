export function MarketplaceCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>

      <div className="flex space-x-2 mb-4">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>

      <div className="h-10 bg-gray-200 rounded-lg"></div>
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </td>
    </tr>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4 animate-pulse">
      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-24"></div>
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function MarketplaceGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <MarketplaceCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf4f0] to-[#f4e5db]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export function InlineLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`${sizeClasses[size]} border-indigo-600 border-t-transparent rounded-full animate-spin`}></div>
  );
}



