import type { Email } from '../types'
import { cc } from '../../../styles/shared'

interface EmailItemProps {
  email: Email
  isSelected: boolean
  onClick: () => void
  formattedDate: string
}

export default function EmailItem({ email, isSelected, onClick, formattedDate }: EmailItemProps) {
  const baseClasses = `${cc.spacing.container.sm} border-b border-gray-200 dark:border-gray-700 cursor-pointer ${cc.transition.colors}`
  
  const backgroundClasses = isSelected
    ? "bg-blue-100 dark:bg-blue-900/50"
    : email.read
    ? "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"

  const senderFontWeight = email.read ? "font-normal" : "font-semibold"
  const subjectFontWeight = email.read ? "font-normal" : "font-medium"

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${backgroundClasses}`}
    >
      <div className="flex justify-between items-center mb-1">
        <p
          className={`text-sm truncate max-w-[70%] ${senderFontWeight} ${
            isSelected ? "text-blue-800 dark:text-blue-200" : "text-gray-900 dark:text-white"
          }`}
        >
          {email.sender}
        </p>
        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
          {formattedDate}
        </span>
      </div>
      <p
        className={`text-sm truncate ${subjectFontWeight} ${
          isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {email.subject}
      </p>
    </div>
  )
}