import React, { forwardRef, useImperativeHandle, useRef } from 'react';

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  multiple?: boolean;
}

export interface FileInputRef {
  clearFiles: () => void;
}

const FileInput = forwardRef<FileInputRef, FileInputProps>(
  ({ className = '', onChange, multiple = false, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const clearFiles = () => {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      clearFiles,
    }));

    return (
      <input
        ref={inputRef}
        multiple={multiple}
        type="file"
        onChange={onChange}
        className={`focus:border-ring-primary-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-none focus:file:ring-primary-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 ${className}`}
        {...props}
      />
    );
  },
);

FileInput.displayName = 'FileInput';

export default FileInput;
