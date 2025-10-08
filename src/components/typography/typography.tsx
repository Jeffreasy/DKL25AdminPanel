interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function H1({ children, className = '' }: TypographyProps) {
  return (
    <h1 className={`text-2xl font-bold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h1>
  )
}

export function H2({ children, className = '' }: TypographyProps) {
  return (
    <h2 className={`text-xl font-semibold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h2>
  )
}

export function H3({ children, className = '' }: TypographyProps) {
  return (
    <h3 className={`text-lg font-medium text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  )
}

export function H4({ children, className = '' }: TypographyProps) {
  return (
    <h4 className={`text-base font-medium text-gray-900 dark:text-white ${className}`}>
      {children}
    </h4>
  )
}

export function Text({ children, className = '' }: TypographyProps) {
  return (
    <p className={`text-base text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </p>
  )
}

export function SmallText({ children, className = '' }: TypographyProps) {
  return (
    <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </p>
  )
}

export function ErrorText({ children, className = '' }: TypographyProps) {
  return (
    <p className={`text-sm text-red-600 dark:text-red-400 ${className}`}>
      {children}
    </p>
  )
}

export function SuccessText({ children, className = '' }: TypographyProps) {
  return (
    <p className={`text-sm text-green-600 dark:text-green-400 ${className}`}>
      {children}
    </p>
  )
}

export function Label({ children, className = '' }: TypographyProps) {
  return (
    <span className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </span>
  )
}

export function Caption({ children, className = '' }: TypographyProps) {
  return (
    <span className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </span>
  )
} 