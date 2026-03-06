import { ChevronsUpDown } from 'lucide-react';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { useNavigate } from 'react-router';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { ROLE } from '../../../utils/Constant';
import { showToast, statusColorMap } from '../../../utils/helper';
import { timesheetPermissions } from '../../../utils/permissions';
import ActionButton from '../../common/ActionButton';
import NoData from '../../common/NoData';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import Pagination from '../../common/Pagination';
import SearchBox from '../../common/SearchBox';
import Select from '../../form/Select';
import Badge from '../../ui/badge/Badge';
import { TableSkeleton } from '../../ui/LoadingSkeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';

function TimesheetModule() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userData: any = useAppSelector((state) => state?.user);

  const [listData, setListData] = useState([]);
  const [pageData, setPageData] = useState({
    totalPages: 0,
    totalRecords: 0,
  });
  const [isLoading, setIsLoadingState] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [payload, setPayload] = useState({
    search: '',
    page: 1,
    limit: 10,
    sort: 'desc',
    sort_field: 'date',
    project_filter: '',
    emp_filter: '',
    date_range: [],
  });

  const handleTimeSheets = async () => {
    try {
      if (isFirstLoad) {
        setIsLoadingState(true);
      }
      const { data } = await apiHandler.TimesheetHandler.list(payload);
      setListData(data?.data?.data);
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

  const handleExportToExcel = async () => {
    try {
      dispatch(setIsLoading(true));
      const response = await apiHandler.TimesheetHandler.exportToExcel(
        payload,
        {
          responseType: 'blob',
        },
      );

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Timesheet.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      showToast('error', error?.message || 'Failed to export Excel');
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    if (payload?.search) {
      const debounceTimer = setTimeout(() => {
        handleTimeSheets();
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      handleTimeSheets();
    }
  }, [
    payload?.search,
    payload?.limit,
    payload?.page,
    payload?.sort,
    payload?.sort_field,
    payload?.emp_filter,
    payload?.project_filter,
    payload?.date_range[1],
  ]);

  const handleFetchDropdownChange = useCallback((name: string, value: any) => {
    setPayload((prev) => ({ ...prev, [name]: value?._id || '' }));
  }, []);

  // Close dropdown on outside click
  const filterArr = [
    userData?.user_type === ROLE.ADMIN && (
      <Select
        endPoints={apiHandler.userHandler.lookup}
        filterStr={`user_type=`}
        value={payload?.emp_filter}
        display="full_name"
        objKey="emp_filter"
        placeholder="Select User"
        func={handleFetchDropdownChange}
        disableClearable={false}
      />
    ),
    <Select
      endPoints={apiHandler.ProjectHandler.lookup}
      filterStr="value="
      value={payload?.project_filter}
      display="name"
      objKey="project_filter"
      placeholder="Select Project"
      func={handleFetchDropdownChange}
      disableClearable={false}
    />,
    <Flatpickr
      id="joining_date"
      placeholder="Select Date Range"
      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
      options={{ mode: 'range', dateFormat: 'd/m/y' }}
      value={
        payload.date_range?.length === 2
          ? payload.date_range.map((dateStr) => new Date(dateStr))
          : undefined
      }
      onChange={(selectedDates: Date[]) =>
        setPayload((prev: any) => ({
          ...prev,
          date_range: selectedDates.map((d) =>
            d ? d.toLocaleDateString('en-CA') : null,
          ),
        }))
      }
    />,
  ];

  const TableCellData = [
    { value: 'Timesheet Date', sort_field: 'date' },
    { value: 'Project Name', sort_field: 'project_id.name' },
    { value: 'Task Name', sort_field: 'task_id.task_name' },
    { value: 'Task Due Date', sort_field: 'task_id.due_date' },
    { value: 'Hours', sort_field: 'hours' },
    { value: 'Task Status', sort_field: 'task_id.status.name' },
    { value: 'Task Flag', sort_field: 'task_id.flag.key' },
    { value: 'Action' },
  ];

  if (userData?.user_type === ROLE.ADMIN) {
    TableCellData.splice(1, 0, {
      value: 'Employee Name',
      sort_field: 'user_id.full_name',
    });
  }

  const handleOnView = (item: any) => {
    navigate(`/timesheet/create?action=view&id=${item?._id}`);
  };

  const handleOnDelete = async (item: any) => {
    try {
      dispatch(setIsLoading(true));

      const { data } = await apiHandler.TimesheetHandler.delete(item?._id);
      showToast('success', data?.message);
      handleTimeSheets();
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleOnEdit = (item: any) => {
    navigate(`/timesheet/create?action=edit&id=${item?._id}`);
  };

  const formatValue = (value: any, fieldName: string) => {
    if (!value) return '-';

    // Simple check for date fields
    if (fieldName.toLowerCase().includes('date')) {
      return moment(value).format('DD/MM/YYYY');
    }

    return value;
  };

  const getValue = (obj: any, path: string): any =>
    path?.split('.').reduce((acc, key) => acc?.[key], obj);

  return (
    <>
      <PageBreadcrumb pageTitle="Timesheet Management" />
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <SearchBox
            payload={payload}
            listData={listData}
            setPayload={setPayload}
            onClick={() => navigate('/timesheet/create')}
            handleExportToExcel={handleExportToExcel}
            filterArr={filterArr}
            currentRole={userData?.user_type}
            permission={[ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.BDE, ROLE.HR]}
          />
          <div className="max-w-full overflow-auto">
            <div className="min-w-[1102px] max-h-[550px] divide-y">
              {isLoading ? (
                <TableSkeleton rows={10} columns={TableCellData.length} />
              ) : (
                <>
                  <Table>
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        {TableCellData.map((item, index) => (
                          <TableCell
                            key={index}
                            isHeader
                            className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
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
                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {listData?.map((item: any) => (
                        <TableRow key={item?._id}>
                          {TableCellData.map((col, idx) => {
                            const cellValue = formatValue(
                              getValue(item, col.sort_field!),
                              col.value,
                            );

                            return (
                              <TableCell
                                key={idx}
                                className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                              >
                                {col.value === 'Action' ? (
                                  <div className="flex justify-start">
                                    <ActionButton
                                      handleOnView={() => handleOnView(item)}
                                      {...(userData?._id ===
                                        item?.user_id?._id && {
                                        handleOnEdit: () => handleOnEdit(item),
                                      })}
                                      {...(userData?._id ===
                                        item?.user_id?._id && {
                                        handleOnDelete: () =>
                                          handleOnDelete(item),
                                      })}
                                      currentRole={userData?.user_type}
                                      permissions={timesheetPermissions}
                                    />
                                  </div>
                                ) : col.value === 'Task Status' ||
                                  col.value === 'Task Flag' ? (
                                  <Badge
                                    size="md"
                                    color={statusColorMap[cellValue] ?? ''}
                                  >
                                    {cellValue}
                                  </Badge>
                                ) : (
                                  <p>{cellValue}</p>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {listData.length === 0 && <NoData />}
                </>
              )}
            </div>
          </div>
          <Pagination
            entriesPerPage={payload?.limit}
            totalEntries={pageData?.totalRecords}
            totalPages={pageData?.totalPages}
            setPayload={setPayload}
            page={payload?.page}
          />
        </div>
      </div>
    </>
  );
}

export default TimesheetModule;
