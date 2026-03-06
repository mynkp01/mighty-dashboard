import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/helper';

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  show?: boolean;
}

const AnimatedNotification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  show = true,
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success-500" />,
    error: <XCircle className="w-5 h-5 text-error-500" />,
    warning: <AlertCircle className="w-5 h-5 text-warning-500" />,
    info: <Info className="w-5 h-5 text-blue-light-500" />,
  };

  const bgColors = {
    success: 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800',
    error: 'bg-error-50 border-error-200 dark:bg-error-900/20 dark:border-error-800',
    warning: 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800',
    info: 'bg-blue-light-50 border-blue-light-200 dark:bg-blue-light-900/20 dark:border-blue-light-800',
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 max-w-sm w-full',
        isExiting ? 'notification-exit' : 'notification-enter'
      )}
    >
      <div
        className={cn(
          'p-4 rounded-lg border shadow-lg backdrop-blur-sm',
          bgColors[type],
          'transform transition-all duration-300 ease-out'
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {icons[type]}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {title}
            </h4>
            {message && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {message}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimatedNotification;