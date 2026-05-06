/**
 * LoadingSpinner Component
 * Displays an animated spinner while data is loading
 * Used across the application for async operations
 */
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

/**
 * SkeletonLoader Component
 * Displays a skeleton loading state for cards
 */
export function SkeletonCard() {
  return (
    <div className="bg-card rounded-lg p-4 animate-pulse">
      <div className="h-32 bg-muted rounded-lg mb-3"></div>
      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
    </div>
  );
}
