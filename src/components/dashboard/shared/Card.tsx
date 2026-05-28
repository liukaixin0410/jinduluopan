import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CardProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export function Card({ children, className, contentClassName, title, subtitle, action }: CardProps) {
  return (
    <div className={cn('card-container', className)}>
      {(title || subtitle || action) && (
        <div className='card-header flex items-center justify-between'>
          <div>
            {title && <h3 className='text-lg font-semibold text-gray-900 leading-tight'>{title}</h3>}
            {subtitle && <p className='text-sm text-gray-500 mt-1 leading-relaxed'>{subtitle}</p>}
          </div>
          {action && <div className='flex items-center gap-3'>{action}</div>}
        </div>
      )}
      <div className={cn('card-content', contentClassName)}>{children}</div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-gray-100 rounded-lg', className)} />
  )
}

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = '数据加载中...' }: LoadingStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-16'>
      <div className='w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin' />
      <p className='mt-4 text-gray-500 text-sm'>{message}</p>
    </div>
  )
}

interface EmptyStateProps {
  message: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ message, description, icon, action }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-16 text-center'>
      {icon && <div className='text-gray-200 mb-5'>{icon}</div>}
      <h4 className='text-gray-900 font-medium text-base'>{message}</h4>
      {description && <p className='text-gray-500 text-sm mt-2 leading-relaxed'>{description}</p>}
      {action && <div className='mt-5'>{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  message?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({ message = '加载失败', description = '请稍后重试', onRetry }: ErrorStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-16 text-center'>
      <div className='w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-5'>
        <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
      </div>
      <p className='text-gray-900 font-medium text-base'>{message}</p>
      <p className='text-gray-500 text-sm mt-2'>{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className='mt-5 btn-primary px-5 py-2.5 text-sm'
        >
          重试
        </button>
      )}
    </div>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
    ghost: 'btn-ghost',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className='w-4 h-4 mr-2 animate-spin' fill='none' viewBox='0 0 24 24'>
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
        </svg>
      ) : null}
      {children}
    </button>
  )
}

interface BadgeProps {
  children: React.ReactNode
  color?: 'gray' | 'blue' | 'green' | 'orange' | 'red' | 'purple'
}

export function Badge({ children, color = 'gray' }: BadgeProps) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    orange: 'bg-orange-50 text-orange-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
  }

  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', colors[color])}>
      {children}
    </span>
  )
}
