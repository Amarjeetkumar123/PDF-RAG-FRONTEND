'use client'
import React, { useState, useEffect } from 'react'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  description?: string
  duration?: number
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onRemove(toast.id), 300) // Wait for animation to complete
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
      case 'error':
        return <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 flex-shrink-0" />
      case 'info':
        return <Info className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
      default:
        return <Info className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/60 shadow-green-100/50'
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200/60 shadow-red-100/50'
      case 'info':
        return 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200/60 shadow-blue-100/50'
      default:
        return 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200/60 shadow-blue-100/50'
    }
  }

  return (
    <div
      className={`fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-[9999] w-fit max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-2 sm:mx-4 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className={`rounded-lg sm:rounded-xl border-2 p-3 sm:p-4 md:p-5 shadow-xl sm:shadow-2xl backdrop-blur-md ${getBackgroundColor()}`}>
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="flex-shrink-0 p-1.5 sm:p-2 rounded-full bg-white/80 shadow-sm">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 whitespace-nowrap flex-shrink-0">{toast.title}</h4>
              {toast.description && (
                <span className="text-xs sm:text-sm text-gray-700 truncate">- {toast.description}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => onRemove(toast.id), 300)
            }}
            className="flex-shrink-0 p-1.5 sm:p-2 hover:bg-white/60 rounded-full transition-all duration-200 hover:scale-105"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

export const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastComponent toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  )
}

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const toast = {
    success: (title: string, description?: string) =>
      addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) =>
      addToast({ type: 'error', title, description }),
    info: (title: string, description?: string) =>
      addToast({ type: 'info', title, description }),
  }

  return { toasts, toast, removeToast }
}
