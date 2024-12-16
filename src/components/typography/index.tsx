interface TextProps {
  children: React.ReactNode
  className?: string
}

export function H1({ children, className = '' }: TextProps) {
  return (
    <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 ${className}`}>
      {children}
    </h1>
  )
}

export function H2({ children, className = '' }: TextProps) {
  return (
    <h2 className={`text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 ${className}`}>
      {children}
    </h2>
  )
}

export function H3({ children, className = '' }: TextProps) {
  return (
    <h3 className={`text-lg sm:text-xl font-medium text-gray-900 ${className}`}>
      {children}
    </h3>
  )
}

export function Body({ children, className = '' }: TextProps) {
  return (
    <p className={`text-base text-gray-600 ${className}`}>
      {children}
    </p>
  )
}

export function SmallText({ children, className = '' }: TextProps) {
  return (
    <p className={`text-sm text-gray-500 ${className}`}>
      {children}
    </p>
  )
}

export function Label({ children, className = '' }: TextProps) {
  return (
    <span className={`text-sm font-medium text-gray-700 ${className}`}>
      {children}
    </span>
  )
}

export function ErrorText({ children, className = '' }: TextProps) {
  return (
    <p className={`text-sm text-red-600 ${className}`}>
      {children}
    </p>
  )
}

export function SuccessText({ children, className = '' }: TextProps) {
  return (
    <p className={`text-sm text-green-600 ${className}`}>
      {children}
    </p>
  )
} 