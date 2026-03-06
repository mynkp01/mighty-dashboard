import {
  Backpack,
  BadgePercent,
  BoxesIcon,
  Building2,
  ChevronDown,
  ChevronRight,
  ContactRound,
  Cpu,
  Earth,
  FolderOpenDot,
  Hourglass,
  Landmark,
  LayoutDashboard,
  ListTodo,
  ScrollText,
  Settings,
  UserRoundCog,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useSidebar } from '../context/SidebarContext';
import { GridIcon, TableIcon, UserIcon } from '../icons';
import { useAppSelector } from '../redux/hooks';
import { ROLE } from '../utils/Constant';

type SubNavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[];
  subItems?: SubNavItem[];
  isDefault?: boolean;
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon className="size-5" />,
    name: 'Dashboard',
    path: '/dashboard',
    roles: [ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.BDE, ROLE.HR],
    isDefault: true,
  },
  {
    name: 'Users',
    icon: <UserIcon className="size-5" />,
    path: '/users',
    roles: [ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.HR],
  },
  {
    name: 'Employees',
    icon: <TableIcon className="size-5" />,
    path: '/employees',
    roles: [ROLE.ADMIN, ROLE.HR],
  },
  {
    name: 'Projects',
    icon: <FolderOpenDot className="size-5" />,
    path: '/project',
    roles: [ROLE.ADMIN],
  },
  {
    name: 'TimeSheet',
    icon: <Hourglass className="size-5" />,
    path: '/timesheet',
    roles: [ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.HR],
  },
  {
    name: 'Cost Estimation',
    icon: <Landmark className="size-5" />,
    path: '/cost-estimation',
    roles: [ROLE.ADMIN],
  },
  {
    name: 'Task Management',
    icon: <ListTodo className="size-5" />,
    path: '/tasks',
    roles: [ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.HR],
  },
  {
    name: 'CRM Management',
    icon: <Cpu className="size-5" />,
    roles: [ROLE.ADMIN],
    subItems: [
      {
        name: 'CRM Dashboard',
        icon: <LayoutDashboard className="size-5" />,
        path: '/crm/dashboard',
      },
      {
        name: 'CRM Clients',
        icon: <UserRoundCog className="size-5" />,
        path: '/crm/clients',
      },
      {
        name: 'CRM Pipeline',
        icon: <Users className="size-5" />,
        path: '/crm/pipeline',
      },
      {
        name: 'CRM Attachments',
        icon: <ScrollText className="size-5" />,
        path: '/crm/attachments-list',
      },
    ],
  },
  {
    name: 'Recruitment Hub',
    icon: <Backpack className="size-5" />,
    path: '/recruitment-hub',
    roles: [ROLE.ADMIN, ROLE.HR],
  },
  {
    name: 'Contact Us',
    icon: <ContactRound className="size-5" />,
    path: '/contact-us-list',
    roles: [ROLE.ADMIN, ROLE.HR],
  },
  {
    name: 'Master',
    icon: <Settings className="size-5" />,
    roles: [ROLE.ADMIN],
    subItems: [
      {
        name: 'Lookup Category',
        icon: <BadgePercent className="size-5" />,
        path: '/lookup-category',
      },
      {
        name: 'Lookup Value',
        icon: <BoxesIcon className="size-5" />,
        path: '/lookup-value',
      },
      {
        name: 'Country',
        icon: <Earth className="size-5" />,
        path: '/country',
      },
      {
        name: 'City',
        icon: <Building2 className="size-5" />,
        path: '/city',
      },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsMobileOpen,
    setIsHovered,
    toggleSidebar,
    toggleMobileSidebar,
  } = useSidebar();
  const location = useLocation();
  const userData: any = useAppSelector((state) => state?.user);

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const isParentActive = (item: NavItem) => {
    if (item?.path) return isActive(item.path);
    if (item?.subItems) {
      return item?.subItems.some((subItem) => isActive(subItem?.path));
    }
    return false;
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName],
    );
  };

  const accessibleNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (item.isDefault) return true;

      if (!item.roles && !item.name) return false;

      if (!userData?.module) {
        const hasRoleAccess =
          item.roles && userData?.user_type
            ? item.roles.includes(userData.user_type)
            : false;

        return hasRoleAccess;
      }

      if (userData?.module && userData?.module?.length > 0) {
        const hasModuleAccess =
          item.name && userData?.module
            ? userData.module.some((m: any) => m.name === item.name)
            : false;

        return hasModuleAccess;
      }

      return false;
    });
  }, [navItems, userData]);

  const handleToggle = () => {
    if (window.innerWidth >= 991) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const sidebarExpanded = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed mt-0 flex flex-col lg:mt-0 top-0 px-3 xs:px-5 left-0 bg-white/95 backdrop-blur-md dark:bg-gray-900/95 dark:border-gray-800 text-gray-900 h-screen transition-all duration-500 ease-out z-50 border-r border-gray-200/50 shadow-xl
        ${
          isExpanded || isMobileOpen
            ? 'w-[290px]'
            : isHovered
              ? 'w-[290px]'
              : 'w-[80px]'
        }
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`py-6 flex justify-between items-center ${
          !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo2.png"
                alt="Logo"
                width={180}
                height={20}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={200}
                height={50}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
        <button
          className="lg:hidden border rounded-md h-fit p-0.5"
          onClick={handleToggle}
          aria-label="Toggle Sidebar"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar px-1">
        <ul className="flex flex-col gap-1">
          {accessibleNavItems.map((nav) => (
            <li key={nav.name} className="w-full">
              {nav.subItems ? (
                // Parent item with sub-items
                <div className="w-full">
                  <button
                    onClick={() => sidebarExpanded && toggleExpanded(nav.name)}
                    className={`menu-item group w-full justify-between hover:scale-[1.02] micro-bounce ${
                      isParentActive(nav)
                        ? 'menu-item-active'
                        : 'menu-item-inactive'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`menu-item-icon-size ${
                          isParentActive(nav)
                            ? 'menu-item-icon-active'
                            : 'menu-item-icon-inactive'
                        }`}
                      >
                        {nav.icon}
                      </span>
                      {sidebarExpanded && (
                        <span className="menu-item-text">{nav.name}</span>
                      )}
                    </div>
                    {sidebarExpanded && (
                      <span className="transition-transform duration-200 flex-shrink-0">
                        {expandedItems.includes(nav.name) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </span>
                    )}
                  </button>

                  {/* Sub-items with smooth animation */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      sidebarExpanded && expandedItems.includes(nav.name)
                        ? 'max-h-96 opacity-100 mt-3'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <ul className="ml-6 space-y-2 dark:border-gray-700">
                      {nav.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            to={subItem.path}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] micro-bounce ${
                              isActive(subItem.path)
                                ? 'bg-gradient-to-r from-primary-50 to-blue-light-50 text-primary-500 dark:bg-gradient-to-r dark:from-primary-900/20 dark:to-blue-light-900/20 dark:text-primary-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:bg-gradient-to-r dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                          >
                            <span>{subItem.icon}</span>
                            <span className="truncate">{subItem.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                // Regular nav item
                <Link
                  to={nav.path!}
                  onClick={() => setIsMobileOpen(false)}
                  className={`menu-item group hover:scale-[1.02] micro-bounce ${
                    isActive(nav.path!)
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path!)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive'
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {sidebarExpanded && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default AppSidebar;
