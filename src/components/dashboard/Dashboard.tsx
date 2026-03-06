import { PartyPopper } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiHandler } from '../../api/apiHandler';
import { BoxIconLine, GroupIcon } from '../../icons';
import { useAppSelector } from '../../redux/hooks';
import { ROLE } from '../../utils/Constant';
import { showToast } from '../../utils/helper';
import DataTable from '../common/DataTable';
import AnimatedCard from '../ui/AnimatedCard';
import { CardSkeleton } from '../ui/LoadingSkeleton';

// Move table data to constants
const TABLE_DATA = {
  TIMESHEET: [
    { value: 'Timesheet Date', sort_field: 'date' },
    { value: 'Employee Name', sort_field: 'user_id.full_name' },
    { value: 'Project Name', sort_field: 'project_id.name' },
    { value: 'Task Name', sort_field: 'task_id.task_name' },
    { value: 'Task Status', sort_field: 'task_status.name' },
    { value: 'Hours', sort_field: 'hours' },
    { value: 'Action' },
  ],
  PROJECT_MATRIX: [
    { value: 'Project Name', sort_field: 'name' },
    { value: 'Estimated Budget', sort_field: 'estimated_budget' },
    { value: 'Available budget', sort_field: 'available_budget' },
    { value: 'Estimated Hours', sort_field: 'estimated_hours' },
    { value: 'Available Hours', sort_field: 'available_hours' },
    { value: 'Project Status', sort_field: 'status.name' },
    { value: 'Action' },
  ],
  EMPLOYEE_BIRTHDAY: [
    { value: 'Date', sort_field: 'date_of_birth' },
    { value: 'Employee Name', sort_field: 'full_name' },
  ],
};

export default function Dashboard() {
  const userData: any = useAppSelector((state) => state?.user);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isLoading, setIsLoadingState] = useState(false);

  const fetchDashboardData = async () => {
    try {
      if (isFirstLoad) {
        setIsLoadingState(true);
      }
      const { data } = await apiHandler.commonHandler.dashboard();
      setDashboardData(data?.data);
      setIsFirstLoad(false);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      setIsLoadingState(false);
    }
  };

  const handleNavigation = (path: string, action: string, id: string) => {
    navigate(`/${path}/create?action=${action}&id=${id}`);
  };

  useEffect(() => {
    if (![ROLE.EMPLOYEE, ROLE.HR].includes(userData?.user_type)) {
      fetchDashboardData();
    }
  }, [userData?.user_type]);

  if (!userData) return null;

  return (
    <div className="space-y-6">
      <AnimatedCard gradient className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-transparent to-primary-500/20 bg-[length:200%_200%] animate-gradientMove" />
        <div className="relative z-10 space-y-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
            <span className="gradient-text">Welcome Back!</span>
            <span className="inline-block ml-2 text-2xl animate-bounce">
              👋
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {userData.full_name}
          </p>
        </div>
      </AnimatedCard>

      {userData.user_type === ROLE.ADMIN && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <CardSkeleton
                  key={i}
                  className="h-24"
                  showDescription={false}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                icon={<GroupIcon className="text-primary-500 size-6" />}
                title="Total Users"
                value={dashboardData?.totalUsers}
                delay={0}
              />
              <StatCard
                icon={<GroupIcon className="text-primary-500 size-6" />}
                title="Total Employees"
                value={dashboardData?.totalEmployee}
                delay={100}
              />
              <StatCard
                icon={<BoxIconLine className="text-primary-500 size-6" />}
                title="Total Projects"
                value={dashboardData?.totalProject}
                delay={200}
              />
              <StatCard
                icon={<PartyPopper className="text-primary-500 size-6" />}
                title="Work Anniversary"
                value={dashboardData?.workAni || 'N/A'}
                delay={300}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <DataTable
              title="Project Matrix"
              showAction
              actionText="View All"
              onAction={() => navigate('/project')}
              columns={TABLE_DATA.PROJECT_MATRIX}
              data={dashboardData?.projectMatrix}
              statusField="Project Status"
              viewNavigate={(item) =>
                handleNavigation('project', 'view', item._id)
              }
              editNavigate={(item) =>
                handleNavigation('project', 'edit', item._id)
              }
              userType={userData?.user_type}
              isLoading={isLoading}
            />
            <DataTable
              title="Recent Timesheet"
              showAction
              actionText="View All"
              onAction={() => navigate('/timesheet')}
              columns={TABLE_DATA.TIMESHEET}
              data={dashboardData?.recentTimesheet}
              statusField="Task Status"
              permissions={{
                [ROLE.ADMIN]: ['view'],
                [ROLE.EMPLOYEE]: [],
                [ROLE.HR]: [],
              }}
              viewNavigate={(item) =>
                handleNavigation('timesheet', 'view', item._id)
              }
              editNavigate={(item) =>
                handleNavigation('timesheet', 'edit', item._id)
              }
              userType={userData?.user_type}
              isLoading={isLoading}
            />
          </div>
        </>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: any;
  delay?: number;
}

const StatCard = ({ icon, title, value, delay = 0 }: StatCardProps) => (
  <AnimatedCard hover delay={delay} className="interactive-card">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {title}
        </p>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'object' ? (
            <div>
              <div>{value?.full_name}</div>
              <p className="text-sm font-normal text-gray-500">
                {moment(value?.joining_date).format('DD-MM-YYYY')}
              </p>
            </div>
          ) : (
            <span className="gradient-text">{value || 0}</span>
          )}
        </div>
      </div>
    </div>
  </AnimatedCard>
);
