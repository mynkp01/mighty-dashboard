import { KeyboardEventHandler } from 'react';

export const ROUTES = {
  // Admin routes
  admin: {
    signIn: '/auth/signin',
    resetPassword: '/auth/resetpassword',
    dashboard: 'dashboard/home',
  },

  home: '/',
  publicPaths: ['/sign-in', '/forgot-password', '/reset-password'],
};

export const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
  const { type } = e.target as HTMLInputElement;
  const numberDisallowedKeys = [
    'ArrowUp',
    'ArrowDown',
    '-',
    '.',
    '+',
    'e',
    'E',
  ];

  if (type === 'number' && numberDisallowedKeys.includes(e.key)) {
    e.preventDefault();
    return;
  }
};

export async function ipAddress() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();

    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
  }
}

export const generateValueCode = (value: string) => {
  return value
    .toUpperCase()
    .replace(/[^a-zA-Z\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
};

export const adminSideBarData = [
  {
    email: 'john.doe@example.com',
    password: 'securePassword',
  },
];

export enum ROLE {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
  BDE = 'BDE',
  HR = 'HR',
}

export enum CRM_TYPES {
  CLOSURE = 'CLOSURE',
  LEAD = 'LEAD',
  PROSPECT = 'PROSPECT',
}
