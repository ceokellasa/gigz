import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const ToastContext = createContext({})

export const useToast = () => useContext(ToastContext)

const TOAST_TYPES = {
    success: {
        icon: CheckCircle,
        className: 'bg-green-50 border-green-200 text-green-800',
        iconClass: 'text-green-500'
    },
    error: {
        icon: AlertCircle,
        className: 'bg-red-50 border-red-200 text-red-800',
        iconClass: 'text-red-500'
    },
    warning: {
        icon: AlertTriangle,
        className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        iconClass: 'text-yellow-500'
    },
    info: {
        icon: Info,
        className: 'bg-blue-50 border-blue-200 text-blue-800',
        iconClass: 'text-blue-500'
    }
}

let toastId = 0

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = ++toastId
        const newToast = { id, message, type }

        setToasts(prev => [...prev, newToast])

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }

        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const toast = useMemo(() => ({
        success: (message, duration) => addToast(message, 'success', duration),
        error: (message, duration) => addToast(message, 'error', duration),
        warning: (message, duration) => addToast(message, 'warning', duration),
        info: (message, duration) => addToast(message, 'info', duration)
    }), [addToast])

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {toasts.map(toast => {
                    const config = TOAST_TYPES[toast.type]
                    const Icon = config.icon
                    return (
                        <div
                            key={toast.id}
                            className={clsx(
                                'flex items-start gap-3 p-4 rounded-xl border shadow-lg pointer-events-auto animate-in slide-in-from-right-5 fade-in',
                                config.className
                            )}
                        >
                            <Icon className={clsx('h-5 w-5 flex-shrink-0 mt-0.5', config.iconClass)} />
                            <p className="flex-1 text-sm font-medium">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )
                })}
            </div>
        </ToastContext.Provider>
    )
}
