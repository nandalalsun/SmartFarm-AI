import { useEffect } from 'react';

/**
 * Toast Notification Component
 * 
 * Features:
 * - Auto-dismiss after 5 seconds
 * - Manual close button
 * - Bottom-right positioning
 * - Success/Error variants
 * - Smooth animations
 */
export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-dismiss after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const styles = {
    success: 'bg-green-500/90 border-green-400 text-white',
    error: 'bg-red-500/90 border-red-400 text-white',
    info: 'bg-blue-500/90 border-blue-400 text-white'
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 animate-slide-in">
      <div className={`${styles[type]} backdrop-blur-sm border-2 rounded-lg shadow-2xl px-6 py-4 min-w-[300px] max-w-md flex items-start gap-3`}>
        <div className="flex-shrink-0 text-2xl">
          {icons[type]}
        </div>
        <div className="flex-1 text-sm font-medium">
          {message}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors ml-2"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
