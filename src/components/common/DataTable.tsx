import moment from 'moment';
import { ROLE } from '../../utils/Constant';
import ActionButton from '../common/ActionButton';
import NoData from '../common/NoData';
import AnimatedButton from '../ui/AnimatedButton';
import AnimatedCard from '../ui/AnimatedCard';
import { TableSkeleton } from '../ui/LoadingSkeleton';
import Badge from '../ui/badge/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../ui/table';

const STATUS_COLORS = {
  Yellow: 'warning',
  Red: 'error',
  Assigned: 'error',
  Green: 'success',
  Completed: 'success',
  Pending: 'error',
  'In Progress': 'warning',
  'Not Started': 'primary',
  'In Review': 'info',
  'On Hold': 'error',
} as const;

const formatValue = (
  value: any,
  fieldName: string,
  item: any,
  currentUserRole: string,
  permissions: Record<string, string[]>,
  editNavigate: (item: any) => void = () => {},
  viewNavigate: (item: any) => void = () => {},
) => {
  const lowerFieldName = fieldName.toLowerCase();

  if (!value && lowerFieldName !== 'action') return '-';

  if (lowerFieldName.includes('date')) {
    return moment(value).format('DD/MM/YYYY');
  }

  if (lowerFieldName === 'action') {
    return (
      <div className="flex justify-start">
        <ActionButton
          handleOnView={() => editNavigate(item)}
          handleOnDelete={() => {}}
          handleOnEdit={() => viewNavigate(item)}
          currentRole={currentUserRole}
          permissions={permissions}
        />
      </div>
    );
  }

  return value;
};

const getValue = (obj: Record<string, any>, path: string): any =>
  path?.split('.').reduce((acc, key) => acc?.[key], obj);

interface DataTableProps {
  title: string;
  showAction?: boolean;
  actionText?: string;
  onAction?: () => void;
  viewNavigate?: (item: any) => void;
  editNavigate?: (item: any) => void;
  columns: Array<{ value: string; sort_field?: string }>;
  data: Array<any>;
  statusField?: string;
  permissions?: Record<string, string[]>;
  userType: string;
  isLoading?: boolean;
}

const DataTable = ({
  title,
  showAction = false,
  actionText = '',
  onAction,
  columns,
  data = [],
  statusField,
  permissions = {
    [ROLE.ADMIN]: ['view', 'edit'],
    [ROLE.EMPLOYEE]: [],
    [ROLE.HR]: [],
  },
  viewNavigate,
  editNavigate,
  userType,
  isLoading = false,
}: DataTableProps) => (
  <AnimatedCard hover className="p-0">
    <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-4 py-3 rounded-t-xl">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
        {title}
      </h3>
      {showAction && !isLoading && (
        <AnimatedButton variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </AnimatedButton>
      )}
    </div>

    <div className="p-4">
      {isLoading ? (
        <TableSkeleton rows={5} columns={columns.length} />
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-700">
              <TableRow>
                {columns.map((col, index) => (
                  <TableCell
                    key={index}
                    isHeader
                    className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide text-left"
                  >
                    {col.value}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.map((item, rowIndex) => (
                <TableRow
                  key={item._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 animate-fadeInUp"
                  style={{ animationDelay: `${rowIndex * 50}ms` }}
                >
                  {columns.map((col, idx) => {
                    const cellValue = formatValue(
                      getValue(item, col.sort_field!),
                      col.value,
                      item,
                      userType,
                      permissions,
                      viewNavigate,
                      editNavigate,
                    );
                    return (
                      <TableCell
                        key={idx}
                        className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                      >
                        {col.value === statusField ? (
                          <Badge
                            size="sm"
                            color={
                              STATUS_COLORS[
                                cellValue as keyof typeof STATUS_COLORS
                              ] || 'default'
                            }
                          >
                            {cellValue}
                          </Badge>
                        ) : (
                          <span>{cellValue}</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!isLoading && data.length === 0 && <NoData />}
        </div>
      )}
    </div>
  </AnimatedCard>
);

export default DataTable;
