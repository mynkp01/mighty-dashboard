import { ReactNode, useState } from 'react';

interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  className?: string;
}

const Popover = ({ trigger, content, className = '' }: PopoverProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {trigger}
      </div>
      {isVisible && (
        <div className={`absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-64 left-0 top-full mt-1 ${className}`}>
          {content}
        </div>
      )}
    </div>
  );
};

export default Popover;