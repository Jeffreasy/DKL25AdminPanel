import { cc } from '../../styles/shared'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  className?: string
}

/**
 * Herbruikbare empty state component
 * Gebruikt voor lege lijsten, geen resultaten, etc.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  const defaultIcon = (
    <svg 
      className={cc.emptyStateIcon()} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
      />
    </svg>
  )

  return (
    <div className={`${cc.emptyState()} ${className}`}>
      <div className="flex flex-col items-center">
        {icon || defaultIcon}
        
        <h3 className={cc.emptyStateTitle()}>
          {title}
        </h3>
        
        {description && (
          <p className={cc.emptyStateDescription()}>
            {description}
          </p>
        )}
        
        {action && (
          <button
            onClick={action.onClick}
            className={cc.button.base({ color: 'primary', className: 'mt-6' })}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}

export default EmptyState