import { toast, ToastOptions } from 'react-toastify';

const defaultToastOptions: ToastOptions = {
  position: 'top-center',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
};

export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value as object).length === 0;
  }
  return false;
};

export const showToast = (
  type: 'success' | 'error' | 'info' | 'warning' | 'default',
  content: string | React.ReactNode,
  options: ToastOptions = {},
): void => {
  const toastOptions = { ...defaultToastOptions, ...options };

  switch (type) {
    case 'success':
      toast.success(content, toastOptions);
      break;
    case 'error':
      toast.error(content, toastOptions);
      break;
    case 'info':
      toast.info(content, toastOptions);
      break;
    case 'warning':
      toast.warning(content, toastOptions);
      break;
    default:
      toast(content, toastOptions);
  }
};

export const getValue = (obj: any, path: string): any =>
  path?.split('.').reduce((acc, key) => acc?.[key], obj);

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export const statusColorMap: Record<
  string,
  'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark'
> = {
  Red: 'error',
  Yellow: 'warning',
  Green: 'success',
  Completed: 'success',
  Pending: 'error',
  Assigned: 'info',
  'In Progress': 'warning',
  'Not Started': 'primary',
  'In Review': 'info',
  'On Hold': 'error',
};

export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(' ');
};

export const hexToRGBA = (hex: string, alpha: number = 1): string => {
  hex = hex.replace('#', '');

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : alpha;

  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
