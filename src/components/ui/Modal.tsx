import { ReactNode } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { cc } from '../../styles/shared'

/**
 * Modal component props
 */
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

/**
 * Generic reusable modal component
 * Reduces duplication across form modals
 * 
 * @example
 * <Modal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="Edit Partner"
 *   footer={<ModalActions />}
 * >
 *   <FormContent />
 * </Modal>
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true
}: ModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  }

  return (
    <div 
      className={`fixed inset-0 ${cc.overlay.medium} backdrop-blur-sm z-50 flex items-center justify-center ${cc.spacing.container.sm}`}
      onClick={onClose}
    >
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${sizeClasses[size]} mx-auto border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${cc.spacing.px.md} ${cc.spacing.py.sm} border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className={cc.button.icon({ color: 'secondary' })}
              aria-label="Sluiten"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`${cc.spacing.px.md} ${cc.spacing.py.sm} bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end ${cc.spacing.gap.md} flex-shrink-0`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Modal actions component for consistent footer buttons
 */
export interface ModalActionsProps {
  onCancel: () => void
  onConfirm: () => void
  cancelText?: string
  confirmText?: string
  isLoading?: boolean
  confirmDisabled?: boolean
  confirmVariant?: 'primary' | 'danger'
}

export function ModalActions({
  onCancel,
  onConfirm,
  cancelText = 'Annuleren',
  confirmText = 'Opslaan',
  isLoading = false,
  confirmDisabled = false,
  confirmVariant = 'primary'
}: ModalActionsProps) {
  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className={cc.button.base({ color: 'secondary' })}
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isLoading || confirmDisabled}
        className={cc.button.base({ color: confirmVariant })}
      >
        {isLoading ? 'Bezig...' : confirmText}
      </button>
    </>
  )
}