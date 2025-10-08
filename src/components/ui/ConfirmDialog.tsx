import { Dialog } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Z_INDEX } from '../../constants/zIndex'
import { cc } from '../../styles/shared'

export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isProcessing?: boolean
}

/**
 * Herbruikbare confirmation dialog component
 * Gebruikt voor delete confirmations, destructive actions, etc.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Bevestigen',
  cancelText = 'Annuleren',
  variant = 'danger',
  isProcessing = false
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
  }

  const iconColor = {
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400'
  }[variant]

  const confirmButtonColor = {
    danger: 'danger' as const,
    warning: 'primary' as const,
    info: 'primary' as const
  }[variant]

  return (
    <Dialog 
      open={open} 
      onClose={() => !isProcessing && onClose()} 
      className={`relative z-[${Z_INDEX.BASE_MODAL + 1}]`}
    >
      <div 
        className={`fixed inset-0 ${cc.overlay.medium} z-[${Z_INDEX.BASE_MODAL + 1}]`} 
        aria-hidden="true" 
      />
      
      <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${Z_INDEX.BASE_MODAL + 1}]`}>
        <Dialog.Panel className={cc.card({ className: "max-w-md w-full p-0" })}>
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${variant === 'danger' ? 'red' : variant === 'warning' ? 'yellow' : 'blue'}-100 dark:bg-${variant === 'danger' ? 'red' : variant === 'warning' ? 'yellow' : 'blue'}-900/30 flex items-center justify-center`}>
                <ExclamationTriangleIcon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  {title}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className={cc.button.base({ 
                color: confirmButtonColor, 
                className: 'w-full sm:w-auto min-w-[100px]' 
              })}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Bezig...
                </div>
              ) : (
                confirmText
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={cc.button.base({ 
                color: 'secondary', 
                className: 'w-full sm:w-auto mt-3 sm:mt-0' 
              })}
            >
              {cancelText}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default ConfirmDialog