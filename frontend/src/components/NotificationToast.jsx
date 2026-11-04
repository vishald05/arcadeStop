import React, { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

export default function NotificationToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const IconComponent = toast.icon || Sparkles;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <div className="toast-box">
        <div className="toast-icon">
          <IconComponent size={18} />
        </div>
        <div className="toast-content">
          <h4 className="toast-title">{toast.title}</h4>
          <p className="toast-message">{toast.message}</p>
        </div>
        <button 
          className="toast-close-btn" 
          onClick={onClose} 
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
