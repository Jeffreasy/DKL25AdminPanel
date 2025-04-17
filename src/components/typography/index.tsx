import React from 'react'

interface TypographyProps {
  children: React.ReactNode
  className?: string
}

export function H1({ children, className = '' }: TypographyProps) {
  return (
    <h1 className={`text-2xl font-bold text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </h1>
  )
}

export function H2({ children, className = '' }: TypographyProps) {
  return (
    <h2 className={`text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </h2>
  )
}

export function H3({ children, className = '' }: TypographyProps) {
  return (
    <h3 className={`text-lg sm:text-xl font-medium text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  )
}

export function Body({ children, className = '' }: TypographyProps) {
  return (
    <p className={`text-base text-gray-600 dark:text-gray-300 ${className}`}>
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

export function Label({ children, className = '' }: TypographyProps) {
  return (
    <span className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </span>
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