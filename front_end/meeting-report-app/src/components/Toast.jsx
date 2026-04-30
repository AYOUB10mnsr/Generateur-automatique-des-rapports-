import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Toast Notification Component
 */
function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div className={`rounded-2xl border shadow-soft-lg p-4 flex items-center gap-3 animate-fade-in max-w-md ${typeStyles[type]}`}>
      {icons[type]}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="text-current opacity-70 hover:opacity-100 transition-smooth">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Toast Container - Manages multiple toasts
 */
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-50">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

export { Toast, ToastContainer };
