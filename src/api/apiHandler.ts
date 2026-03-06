import { AxiosRequestConfig } from 'axios';
import apiClient from './apiClient';

const authHandler = {
  signIn: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/auth/sign-in', payload, options);
  },
  viewProfile: (options?: AxiosRequestConfig<any>) => {
    return apiClient.get('/auth/view-profile', options);
  },
  updateProfile: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/auth/update-profile', payload, options);
  },
  changePassword: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/auth/change-password', payload, options);
  },
  forgotPassword: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/auth/forgot-password-link', payload, options);
  },
  resetPassword: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/auth/reset-password', payload, options);
  },
  contactUsList: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/contact-us-list', payload, options);
  },
};

const userHandler = {
  list: (payload?: any, query?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post(`/users/list?${query}`, payload, options);
  },
  create: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/users', payload, options);
  },
  get: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/users/${id}`, options);
  },
  update: (id?: string, payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.put(`/users/${id}`, payload, options);
  },
  delete: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.delete(`/users/${id}`, options);
  },
  lookup: (query?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/user-lookup?${query}`, options);
  },
  lookup_user: (query?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/crm-user?${query}`, options);
  },
};

const lookupCategoryHandler = {
  list: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/lookup-category/list', payload, options);
  },
  create: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/lookup-category', payload, options);
  },
  get: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/lookup-category/${id}`, options);
  },
  lookup: (query?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/lookup-category-lookup?${query}`, options);
  },
  delete: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.delete(`/lookup-category/${id}`, options);
  },
  update: (id?: string, payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.put(`/lookup-category/${id}`, payload, options);
  },
};

const lookupValueHandler = {
  list: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/lookup-value/list', payload, options);
  },
  lookupValue: (query?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/lookup-value-list?${query}`, options);
  },
  create: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/lookup-value', payload, options);
  },
  get: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/lookup-value/${id}`, options);
  },
  delete: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.delete(`/lookup-value/${id}`, options);
  },
  update: (id?: string, payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.put(`/lookup-value/${id}`, payload, options);
  },
};

const ProjectHandler = {
  list: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/project-management/list', payload, options);
  },
  projectMatrix: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post(
      '/timesheet-management/project-matrix',
      payload,
      options,
    );
  },
  create: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/project-management', payload, options);
  },
  get: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/project-management/${id}`, options);
  },
  delete: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.delete(`/project-management/${id}`, options);
  },
  update: (id?: string, payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.put(`/project-management/${id}`, payload, options);
  },
  lookup: (query?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/project-management-lookup?${query}`, options);
  },
  downloadPdf: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/project-details-pdf/${id}`, options);
  },
};

const TimesheetHandler = {
  list: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/timesheet-management/list', payload, options);
  },
  create: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/timesheet-management', payload, options);
  },
  get: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/timesheet-management/${id}`, options);
  },
  delete: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.delete(`/timesheet-management/${id}`, options);
  },
  update: (id?: string, payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.put(`/timesheet-management/${id}`, payload, options);
  },
  exportToExcel: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post(`/export-to-excel`, payload, options);
  },
};

const costEstimationHandler = {
  list: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/cost-estimation/list', payload, options);
  },
  create: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/cost-estimation', payload, options);
  },
  get: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/cost-estimation/${id}`, options);
  },
  delete: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.delete(`/cost-estimation/${id}`, options);
  },
  update: (id?: string, payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.put(`/cost-estimation/${id}`, payload, options);
  },
};

const TaskHandler = {
  list: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/task/list', payload, options);
  },
  create: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/task', payload, options);
  },
  get: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/task/${id}`, options);
  },
  delete: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.delete(`/task/${id}`, options);
  },
  update: (id?: string, payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.put(`/task/${id}`, payload, options);
  },
  lookup: (query?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/task-lookup?${query}`, options);
  },
  updateStatus: (
    id?: string,
    payload?: any,
    options?: AxiosRequestConfig<any>,
  ) => {
    return apiClient.put(`/task-status/${id}`, payload, options);
  },
};

const crmHandler = {
  list: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/crm/list', payload, options);
  },
  updateStatus: (
    id?: any,
    payload?: any,
    options?: AxiosRequestConfig<any>,
  ) => {
    return apiClient.put(`/crm-update-status/${id}`, payload, options);
  },
  mainList: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/crm-main-list', payload, options);
  },
  create: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/crm', payload, options);
  },
  get: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/crm/${id}`, options);
  },
  delete: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.delete(`/crm/${id}`, options);
  },
  update: (id?: string, payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.put(`/crm/${id}`, payload, options);
  },
  lookup: (query?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/crm-lookup?${query}`, options);
  },
  dashboard: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post(`/crm-dashboard`, payload, options);
  },
  attachment: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post(`/crm/attachment`, payload, options);
  },
  attachmentList: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/crm/attachment-list', payload, options);
  },
  attachmentListWithPagination: (
    payload?: any,
    options?: AxiosRequestConfig<any>,
  ) => {
    return apiClient.post('/crm-attachment-list', payload, options);
  },
  attachmentDelete: (
    id?: string,
    query?: any,
    options?: AxiosRequestConfig<any>,
  ) => {
    return apiClient.delete(
      `/crm/attachment-delete/${id}?${query ? query : ''}`,
      options,
    );
  },
  attachmentView: (id?: string, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/crm/attachment-view/${id}`, options);
  },
  importExcel: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post(`/crm/import-excel`, payload, options);
  },
  convertTo: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/convert-crm-main', payload, options);
  },
  pipelineUserList: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post(`/crm/pipeline-users`, payload, options);
  },
};

const commonHandler = {
  dashboard: (options?: AxiosRequestConfig<any>) => {
    return apiClient.get('/dashboard-data', options);
  },
};

const countryHandler = {
  list: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/country/list', payload, options);
  },
  create: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/country', payload, options);
  },
  get: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/country/${id}`, options);
  },
  lookup: (query?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/country-lookup?${query}`, options);
  },
  delete: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.delete(`/country/${id}`, options);
  },
  update: (id?: string, payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.put(`/country/${id}`, payload, options);
  },
};

const CityHandler = {
  list: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/city/list', payload, options);
  },
  create: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/city', payload, options);
  },
  get: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/city/${id}`, options);
  },
  lookup: (query?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/city-lookup?${query}`, options);
  },
  delete: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.delete(`/city/${id}`, options);
  },
  update: (id?: string, payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.put(`/city/${id}`, payload, options);
  },
};

const RecruitmentHubHandler = {
  list: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/recruitment-hub/list', payload, options);
  },
  create: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post('/recruitment-hub', payload, options);
  },
  get: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/recruitment-hub/${id}`, options);
  },
  delete: (id?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.delete(`/recruitment-hub/${id}`, options);
  },
  update: (id?: string, payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.put(`/recruitment-hub/${id}`, payload, options);
  },
  lookup: (query?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.get(`/recruitment-hub-lookup?${query}`, options);
  },
  importExcel: (payload?: any, options?: AxiosRequestConfig<any>) => {
    return apiClient.post(`/recruitment-hub/import-excel`, payload, options);
  },
};

export const apiHandler = {
  authHandler,
  crmHandler,
  lookupCategoryHandler,
  lookupValueHandler,
  ProjectHandler,
  TimesheetHandler,
  userHandler,
  costEstimationHandler,
  TaskHandler,
  commonHandler,
  countryHandler,
  CityHandler,
  RecruitmentHubHandler,
};
