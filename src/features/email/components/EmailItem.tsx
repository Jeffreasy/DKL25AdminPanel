import type { Email } from '../types'
import { cl } from '../../../styles/shared' // Import the utility

interface EmailItemProps {
  email: Email
  isSelected: boolean
  onClick: () => void
  formattedDate: string
}

export default function EmailItem({ email, isSelected, onClick, formattedDate }: EmailItemProps) {
  const baseClasses = "p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors duration-200"
  
  const backgroundClasses = isSelected
    ? "bg-indigo-100 dark:bg-indigo-900/50" // Selected state
    : email.read
    ? "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50" // Read state
    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" // Unread state

  const senderFontWeight = email.read ? "font-normal" : "font-semibold"
  const subjectFontWeight = email.read ? "font-normal" : "font-medium"

  return (
    <div
      onClick={onClick}
      className={cl(baseClasses, backgroundClasses)}
    >
      <div className="flex justify-between items-center mb-1">
        <p 
          className={cl(
            "text-sm truncate max-w-[70%]", // Tailwind for size, truncate
            senderFontWeight, // Dynamic font weight
            isSelected ? "text-indigo-800 dark:text-indigo-200" : "text-gray-900 dark:text-gray-100" // Text color based on selection
          )}
        >
          {email.sender}
        </p>
        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
          {formattedDate}
        </span>
      </div>
      <p
        className={cl(
          "text-sm truncate", // Tailwind for size, truncate
          subjectFontWeight, // Dynamic font weight
          isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300" // Text color based on selection
        )}
      >
        {email.subject}
      </p>
    </div>
  )
} 