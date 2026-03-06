import { ROLE } from './Constant';

export const timesheetPermissions = {
  [ROLE.ADMIN]: ['view', 'edit', 'delete'],
  [ROLE.EMPLOYEE]: ['view', 'edit', 'delete'],
  [ROLE.BDE]: ['view', 'edit', 'delete'],
  [ROLE.HR]: ['view', 'edit', 'delete'],
};

export const commonPermissions = {
  [ROLE.ADMIN]: ['view', 'edit', 'delete'],
  [ROLE.EMPLOYEE]: [],
  [ROLE.BDE]: [],
  [ROLE.HR]: [],
};

export const taskPermissions = {
  [ROLE.ADMIN]: ['view', 'edit', 'delete'],
  [ROLE.EMPLOYEE]: ['view'],
  [ROLE.BDE]: ['view'],
  [ROLE.HR]: ['view'],
};

export const crmPermissions = {
  [ROLE.ADMIN]: ['view', 'edit', 'delete'],
  // [ROLE.EMPLOYEE]: ['view', 'edit', 'delete'],
  [ROLE.BDE]: ['view', 'edit', 'delete'],
};
