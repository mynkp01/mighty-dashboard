import React from 'react';
import { cn } from '../../utils/helper';

interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'floating';
}

const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  error,
  icon,
  variant = 'default',
  className,
  ...props
}) => {
  const baseInputClasses =
    'w-full rounded-lg border px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500';

  const variantClasses = {
    default:
      'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400',
    floating:
      'border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white placeholder-transparent peer',
  };

  return (
    <div className="space-y-1">
      {label && variant === 'default' && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          className={cn(
            baseInputClasses,
            variantClasses[variant],
            icon ? 'pl-10' : '',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : '',
            className,
          )}
          {...props}
        />

        {label && variant === 'floating' && (
          <label className="absolute left-4 top-2.5 text-sm text-gray-400 transition-all duration-200 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary-500">
            {label}
          </label>
        )}
      </div>

      {error && <p className="text-sm text-red-500 animate-fadeIn">{error}</p>}
    </div>
  );
};

export default EnhancedInput;
