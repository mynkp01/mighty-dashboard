import React, { ReactNode } from 'react';
import { cn } from '../../../utils/helper';

// Props for Table
interface TableProps {
  children: ReactNode;
  className?: string;
  animated?: boolean;
}

// Props for TableHeader
interface TableHeaderProps {
  children: ReactNode;
  className?: string;
  sticky?: boolean;
}

// Props for TableBody
interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

// Props for TableRow
interface TableRowProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  animated?: boolean;
  delay?: number;
}

// Props for TableCell
interface TableCellProps {
  children: ReactNode;
  isHeader?: boolean;
  className?: string;
}

// Table Component
const Table: React.FC<TableProps> = ({
  children,
  className,
  animated = true,
}) => {
  return (
    <table
      className={cn('min-w-full', animated && 'animate-fadeIn', className)}
    >
      {children}
    </table>
  );
};

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  className,
  sticky = true,
}) => {
  return (
    <thead
      className={cn(
        'bg-gray-50 dark:bg-gray-800/50',
        sticky && 'sticky top-0 z-10',
        className,
      )}
    >
      {children}
    </thead>
  );
};

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return (
    <tbody
      className={cn(
        'divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900',
        className,
      )}
    >
      {children}
    </tbody>
  );
};

// TableRow Component
const TableRow: React.FC<TableRowProps> = ({
  children,
  className,
  style,
  animated = true,
  delay = 0,
}) => {
  return (
    <tr
      className={cn(
        'transition-all duration-200',
        animated &&
          'animate-fadeInUp hover:bg-gray-50 dark:hover:bg-gray-800/50',
        className,
      )}
      style={{
        ...style,
        ...(animated && delay > 0 ? { animationDelay: `${delay}ms` } : {}),
      }}
    >
      {children}
    </tr>
  );
};

// TableCell Component
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
}) => {
  const CellTag = isHeader ? 'th' : 'td';
  const baseClasses = isHeader
    ? 'px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide bg-gray-50 dark:bg-gray-800/50'
    : 'px-4 py-3 text-sm text-gray-700 dark:text-gray-300';

  return <CellTag className={cn(baseClasses, className)}>{children}</CellTag>;
};

export { Table, TableBody, TableCell, TableHeader, TableRow };
