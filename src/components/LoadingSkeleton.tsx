import { cl } from '../styles/shared'

interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div className={cl(
      'animate-pulse bg-gray-200 rounded',
      className
    )} />
  )
} 