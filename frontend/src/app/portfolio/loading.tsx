'use client';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Portfolio Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-72 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="dashboard-stat-new backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-6 w-36 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-300 dark:bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation */}
      <div className="flex border-b border-border mb-6 overflow-x-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-6 py-3">
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="premium-card p-6 mb-6 animate-pulse">
            <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-8"></div>
            <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
          
          <div className="premium-card p-6 animate-pulse">
            <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                  <div>
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                    <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="premium-card p-6 animate-pulse h-fit">
          <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-48 w-full bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>
          <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    </div>
  );
}