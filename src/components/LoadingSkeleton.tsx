interface LoadingSkeletonProps {
  className?: string
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = () => {
  return (
    <div className="animate-pulse bg-gray-200 rounded-md h-full w-full" />
  )
} 