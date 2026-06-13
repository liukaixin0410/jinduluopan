import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  RefreshCw,
  Inbox,
  AlertCircle,
  Search,
  Check,
  X,
} from 'lucide-react'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* ===========================================================
   Card - Primary content container
   =========================================================== */
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
        <div className="card-header flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-base font-semibold text-slate-900 tracking-tight leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn('card-content', contentClassName)}>{children}</div>
    </div>
  )
}

/* ===========================================================
   Button
   =========================================================== */
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
  const variants: Record<string, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  }

  const sizes: Record<string, string> = {
    sm: '!px-3 !py-1.5 !text-xs',
    md: '',
    lg: '!px-6 !py-2.5 !text-base',
  }

  return (
    <button
      className={cn(variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}

/* ===========================================================
   Badge
   =========================================================== */
interface BadgeProps {
  children: React.ReactNode
  color?: 'gray' | 'blue' | 'green' | 'orange' | 'red' | 'purple'
  className?: string
}

export function Badge({ children, color = 'gray', className }: BadgeProps) {
  const colors: Record<string, string> = {
    gray: 'badge-gray',
    blue: 'badge-blue',
    green: 'badge-green',
    orange: 'badge-orange',
    red: 'badge-red',
    purple: 'badge-purple',
  }
  return <span className={cn(colors[color], className)}>{children}</span>
}

/* ===========================================================
   Skeleton - Loading placeholders
   =========================================================== */
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-slate-100',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer',
        'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        className
      )}
    />
  )
}

/* ===========================================================
   Loading State
   =========================================================== */
interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = '加载中...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-slate-200" />
        <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-primary-500 animate-spin" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{message}</p>
    </div>
  )
}

/* ===========================================================
   Empty State
   =========================================================== */
interface EmptyStateProps {
  message: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ message, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
          {icon || <Inbox className="w-8 h-8 text-slate-300" strokeWidth={1.5} />}
        </div>
      </div>
      <h4 className="text-slate-900 font-semibold text-base">{message}</h4>
      {description && (
        <p className="text-slate-500 text-sm mt-1.5 leading-relaxed max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ===========================================================
   Error State
   =========================================================== */
interface ErrorStateProps {
  message?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({ message = '加载失败', description = '请稍后重试', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-5">
        <AlertCircle className="w-7 h-7" strokeWidth={2} />
      </div>
      <p className="text-slate-900 font-semibold text-base">{message}</p>
      <p className="text-slate-500 text-sm mt-1.5">{description}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-5">
          <RefreshCw className="w-4 h-4" />
          重试
        </Button>
      )}
    </div>
  )
}

/* ===========================================================
   Icon Button - Small circular action
   =========================================================== */
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function IconButton({ children, className, ...props }: IconButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center w-9 h-9 rounded-xl',
        'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
        'focus:outline-none focus:ring-2 focus:ring-slate-200',
        'disabled:opacity-50 disabled:pointer-events-none',
        'transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* ===========================================================
   Section Title - For content sections within cards
   =========================================================== */
interface SectionTitleProps {
  title: string
  action?: React.ReactNode
  className?: string
}

export function SectionTitle({ title, action, className }: SectionTitleProps) {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
      {action}
    </div>
  )
}

/* ===========================================================
   Icon helpers (re-export lucide icons commonly needed)
   =========================================================== */
export { Check, X, Search, RefreshCw }
