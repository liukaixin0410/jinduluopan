import { X } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />

        {/* Panel */}
        <div
          className={cn(
            'relative w-full rounded-2xl bg-white shadow-float',
            'animate-slide-up',
            sizes[size]
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-6 pb-5 border-b border-slate-100">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h3>
              {description && (
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
                       text-slate-400 hover:bg-slate-100 hover:text-slate-700
                       transition-all duration-200"
              aria-label="关闭"
            >
              <X className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 pt-5 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
