import { JSX } from 'react';
import ContactUsList from './components/admin/ContactUs/List';
import CostEstimationCreate from './components/admin/CostEstimation/Create';
import CostEstimationList from './components/admin/CostEstimation/List';
import CityAction from './components/admin/Country/CityAction';
import CityList from './components/admin/Country/CityList';
import CountryAction from './components/admin/Country/CountryAction';
import CountryList from './components/admin/Country/CountryList';
import CrmAction from './components/admin/Crm/CrmAction';
import CrmAttachment from './components/admin/Crm/CrmAttachment';
import CrmAttachmentsLists from './components/admin/Crm/CrmAttachmentsLists';
import CrmDashboard from './components/admin/Crm/CrmDashboard';
import CrmList from './components/admin/Crm/CrmList';
import CrmPipelineUsersList from './components/admin/Crm/CrmPipelineUsersList';
import EmployeeCreate from './components/admin/Employee/Create';
import EmployeeList from './components/admin/Employee/List';
import CategoryCreate from './components/admin/LookupCategory/Create';
import LookupCategoryList from './components/admin/LookupCategory/List';
import CategoryValueCreate from './components/admin/LookupValue/Create';
import LookupValueList from './components/admin/LookupValue/List';
import ProjectCreate from './components/admin/Project/Create';
import ProjectModule from './components/admin/Project/List';
import ProjectViewDetails from './components/admin/Project/ViewDetails';
import RecruitmentHubAction from './components/admin/RecruitmentHub/Action';
import RecruitmentHubList from './components/admin/RecruitmentHub/List';
import TaskAction from './components/admin/TaskManagement/Action';
import TaskList from './components/admin/TaskManagement/List';
import TimesheetCreate from './components/admin/Timesheet/Create';
import TimesheetModule from './components/admin/Timesheet/List';
import UserOption from './components/admin/User/Create';
import UserList from './components/admin/User/List';
import ForgotPassword from './pages/AuthPages/ForgotPassword';
import ResetPassword from './pages/AuthPages/ResetPassword';
import SignIn from './pages/AuthPages/SignIn';
import Home from './pages/Dashboard/Home';
import UserProfiles from './pages/UserProfiles';
import { ROLE } from './utils/Constant';

export const routes: {
  path: string;
  element: JSX.Element;
  allowedRoles: string[];
  requiredModule?: string;
}[] = [
  {
    path: '/dashboard',
    element: <Home />,
    allowedRoles: [ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.BDE, ROLE.HR],
  },
  {
    requiredModule: 'Employees',
    path: '/employees',
    element: <EmployeeList />,
    allowedRoles: [ROLE.ADMIN, ROLE.HR],
  },
  {
    requiredModule: 'Employees',
    path: '/employees/create',
    element: <EmployeeCreate />,
    allowedRoles: [ROLE.ADMIN, ROLE.HR],
  },
  {
    requiredModule: 'Master',
    path: '/lookup-value',
    element: <LookupValueList />,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    requiredModule: 'Master',
    path: '/lookup-value/create',
    element: <CategoryValueCreate />,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    requiredModule: 'Master',
    path: '/lookup-category',
    element: <LookupCategoryList />,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    requiredModule: 'Master',
    path: '/lookup-category/create',
    element: <CategoryCreate />,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    path: '/profile',
    element: <UserProfiles />,
    allowedRoles: [ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.BDE, ROLE.HR],
  }, // Profile usually for all
  {
    requiredModule: 'Projects',
    path: '/project',
    element: <ProjectModule />,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    requiredModule: 'Projects',
    path: '/project/create',
    element: <ProjectCreate />,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    requiredModule: 'Projects',
    path: '/project/view-details',
    element: <ProjectViewDetails />,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    requiredModule: 'TimeSheet',
    path: '/timesheet',
    element: <TimesheetModule />,
    allowedRoles: [ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.BDE, ROLE.HR],
  },
  {
    requiredModule: 'TimeSheet',
    path: '/timesheet/create',
    element: <TimesheetCreate />,
    allowedRoles: [ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.BDE, ROLE.HR],
  },
  {
    requiredModule: 'Users',
    path: '/users',
    element: <UserList />,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    requiredModule: 'Users',
    path: '/users/create',
    element: <UserOption />,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    requiredModule: 'Cost Estimation',
    path: '/cost-estimation',
    element: <CostEstimationList />,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    requiredModule: 'Cost Estimation',
    path: '/cost-estimation/create',
    element: <CostEstimationCreate />,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    requiredModule: 'Task Management',
    path: '/tasks',
    element: <TaskList />,
    allowedRoles: [ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.BDE, ROLE.HR],
  },
  {
    requiredModule: 'Task Management',
    path: '/tasks/create',
    element: <TaskAction />,
    allowedRoles: [ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.BDE, ROLE.HR],
  },
  {
    requiredModule: 'CRM Management',
    path: '/crm/dashboard',
    element: <CrmDashboard />,
    allowedRoles: [ROLE.ADMIN, ROLE.BDE],
  },
  {
    requiredModule: 'CRM Management',
    path: '/crm/clients',
    element: <CrmList />,
    allowedRoles: [ROLE.ADMIN, ROLE.BDE],
  },
  {
    requiredModule: 'CRM Management',
    path: '/crm/clients/create',
    element: <CrmAction />,
    allowedRoles: [ROLE.ADMIN, ROLE.BDE],
  },
  {
    requiredModule: 'CRM Management',
    path: '/crm/pipeline',
    element: <CrmPipelineUsersList />,
    allowedRoles: [ROLE.ADMIN, ROLE.BDE],
  },
  {
    requiredModule: 'CRM Management',
    path: '/crm/pipeline/attachment',
    element: <CrmAttachment />,
    allowedRoles: [ROLE.ADMIN, ROLE.BDE],
  },
  {
    requiredModule: 'CRM Management',
    path: '/crm/attachments-list',
    element: <CrmAttachmentsLists />,
    allowedRoles: [ROLE.ADMIN, ROLE.BDE],
  },
  {
    requiredModule: 'Master',
    path: '/country',
    element: <CountryList />,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    requiredModule: 'Master',
    path: '/country/create',
    element: <CountryAction />,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    requiredModule: 'Master',
    path: '/city',
    element: <CityList />,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    requiredModule: 'Master',
    path: '/city/create',
    element: <CityAction />,
    allowedRoles: [ROLE.ADMIN],
  },
  {
    requiredModule: 'Recruitment Hub',
    path: '/recruitment-hub',
    element: <RecruitmentHubList />,
    allowedRoles: [ROLE.ADMIN, ROLE.HR],
  },
  {
    requiredModule: 'Recruitment Hub',
    path: '/recruitment-hub/create',
    element: <RecruitmentHubAction />,
    allowedRoles: [ROLE.ADMIN, ROLE.HR],
  },
  {
    requiredModule: 'Contact Us',
    path: '/contact-us-list',
    element: <ContactUsList />,
    allowedRoles: [ROLE.ADMIN, ROLE.HR],
  },
];

export const authRoutes: {
  path: string;
  element: JSX.Element;
}[] = [
  {
    path: '/',
    element: <SignIn />,
  },
  {
    path: '/sign-in',
    element: <SignIn />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
];
