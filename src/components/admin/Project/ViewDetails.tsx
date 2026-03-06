import { ChevronsUpDown } from 'lucide-react';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { apiHandler } from '../../../api/apiHandler';
import { useAppSelector } from '../../../redux/hooks';
import { ROLE } from '../../../utils/Constant';
import { showToast } from '../../../utils/helper';
import NoData from '../../common/NoData';
import Pagination from '../../common/Pagination';
import SearchBox from '../../common/SearchBox';
import Select from '../../form/Select';
import { TableSkeleton } from '../../ui/LoadingSkeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';

function ProjectViewDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id: any = searchParams.get('id');

  const userData: any = useAppSelector((state) => state?.user);

  const [listData, setListData] = useState([]);
  const [viewProjectData, setViewProjectData] = useState<any>(null);
  const [pageData, setPageData] = useState({
    totalPages: 0,
    totalRecords: 0,
  });
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isLoading, setIsLoadingState] = useState(false);
  const [payload, setPayload] = useState({
    project_id: id,
    search: '',
    page: 1,
    limit: 10,
    sort: 'desc',
    sort_field: 'updatedAt',
    emp_filter: '',
  });

  const handleFetchDropdownChange = useCallback((name: string, value: any) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value?._id || '',
    }));
  }, []);

  const filterArr = [
    <Select
      endPoints={apiHandler.userHandler.lookup}
      filterStr={`user_type=${ROLE.EMPLOYEE}`}
      value={payload?.emp_filter}
      display="full_name"
      objKey="emp_filter"
      placeholder="Select Employee"
      func={handleFetchDropdownChange}
    />,
  ];

  const handleViewProjectDetails = async () => {
    try {
      if (isFirstLoad) {
        setIsLoadingState(true);
      }
      const { data } = await apiHandler.ProjectHandler.projectMatrix(
        { ...payload, project_id: id },
        id,
      );
      setViewProjectData(data?.data?.data?.project_id);
      setListData(data?.data?.data?.timesheet_data);
      setPageData({
        ...pageData,
        totalPages: data?.data?.totalPages,
        totalRecords: data?.data?.totalRecords,
      });
      setIsFirstLoad(false);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      setIsLoadingState(false);
    }
  };

  useEffect(() => {
    if (id) {
      handleViewProjectDetails();
    }
  }, [
    payload?.search,
    payload?.limit,
    payload?.page,
    payload.emp_filter,
    payload.sort_field,
    payload.sort,
  ]);

  const TableCellData = [
    { value: 'Date', sort_field: 'date' },
    { value: 'Employee Name', sort_field: 'user_id.full_name' },
    { value: 'Task Name', sort_field: 'task_id.task_name' },
    { value: 'Task Status', sort_field: 'task_status.name' },
    { value: 'Hours', sort_field: 'hours' },
    { value: 'Hours Cost', sort_field: 'hours_cost' },
  ];

  const formatValue = (value: any, fieldName: string) => {
    if (!value) return '-';

    if (fieldName.toLowerCase().includes('date')) {
      return moment(value).format('DD-MM-YYYY');
    }

    return value;
  };

  const getValue = (obj: any, path: string): any =>
    path?.split('.').reduce((acc, key) => acc?.[key], obj);

  return (
    <>
      <div className="space-y-8 p-6 bg-gray-50 dark:bg-black min-h-screen">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-6 space-y-2">
            <p className="text-lg font-semibold text-gray-700 dark:text-white">
              Budget Details
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Estimated Budget:{' '}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {viewProjectData?.estimated_budget?.toLocaleString()}
              </span>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Available Budget:{' '}
              <span className="font-bold text-green-600 dark:text-green-400">
                {viewProjectData?.available_budget?.toLocaleString()}
              </span>
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-6 space-y-2">
            <p className="text-lg font-semibold text-gray-700 dark:text-white">
              Hour Details
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Estimated Hours:{' '}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {viewProjectData?.estimated_hours?.toLocaleString()}
              </span>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Available Hours:{' '}
              <span className="font-bold text-green-600 dark:text-green-400">
                {viewProjectData?.available_hours?.toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-xl shadow-md">
          <div className="border-b border-gray-100 dark:border-white/[0.05]">
            <SearchBox
              payload={payload}
              setPayload={setPayload}
              onClick={() => navigate('/timesheet/create')}
              currentRole={userData?.user_type}
              permission={[ROLE.EMPLOYEE]}
              filterArr={filterArr}
            />
          </div>

          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1102px] divide-y">
              {isLoading ? (
                <TableSkeleton rows={10} columns={TableCellData.length} />
              ) : (
                <>
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-gray-800">
                      <TableRow>
                        {TableCellData.map((item, index) => (
                          <TableCell
                            key={index}
                            isHeader
                            className="px-4 py-3 font-medium text-gray-800 dark:text-gray-300 text-start text-theme-sm"
                          >
                            <div
                              className="flex w-fit gap-1 items-center select-none cursor-pointer hover:text-primary-500 transition-colors"
                              onClick={() =>
                                item?.value !== 'Action' &&
                                setPayload((prev: any) => ({
                                  ...prev,
                                  sort_field: item?.sort_field,
                                  sort:
                                    payload.sort === 'desc' ? 'asc' : 'desc',
                                  page: 1,
                                }))
                              }
                            >
                              {item?.value}
                              {item?.value !== 'Action' && (
                                <ChevronsUpDown className="size-3.5" />
                              )}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {listData?.map((item: any) => (
                        <TableRow key={item?._id}>
                          {TableCellData.map((col, idx) => (
                            <TableCell
                              key={idx}
                              className="px-4 py-3 text-gray-600 dark:text-gray-400 text-start text-theme-sm"
                            >
                              {formatValue(
                                getValue(item, col.sort_field!),
                                col.value,
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {listData.length === 0 && <NoData />}
                </>
              )}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 dark:border-white/[0.05]">
              <Pagination
                entriesPerPage={payload?.limit}
                totalEntries={pageData?.totalRecords}
                setPayload={setPayload}
                totalPages={pageData?.totalPages}
                page={payload?.page}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProjectViewDetails;
