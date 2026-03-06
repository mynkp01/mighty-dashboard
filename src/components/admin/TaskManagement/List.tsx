import { ChevronsUpDown } from 'lucide-react';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiHandler } from '../../../api/apiHandler';
import { useModal } from '../../../hooks/useModal';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { ROLE } from '../../../utils/Constant';
import { showToast, statusColorMap } from '../../../utils/helper';
import { taskPermissions } from '../../../utils/permissions';
import ActionButton from '../../common/ActionButton';
import NoData from '../../common/NoData';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import Pagination from '../../common/Pagination';
import SearchBox from '../../common/SearchBox';
import Label from '../../form/Label';
import Select from '../../form/Select';
import AnimatedButton from '../../ui/AnimatedButton';
import AssignToBadges from '../../ui/badge/AssignToBadges';
import Badge from '../../ui/badge/Badge';
import { TableSkeleton } from '../../ui/LoadingSkeleton';
import { Modal } from '../../ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';

const countries = [
  { code: 'Red', label: 'Red' },
  { code: 'Yellow', label: 'Yellow' },
  { code: 'Green', label: 'Green' },
];

const TableCellData = [
  { value: 'Project Name', sort_field: 'project_id.name' },
  { value: 'Task Name', sort_field: 'task_name' },
  { value: 'Assign To', sort_field: 'assigned_to' },
  { value: 'Start Date', sort_field: 'start_date' },
  { value: 'Due Date', sort_field: 'due_date' },
  { value: 'Status', sort_field: 'status.name' },
  { value: 'Flag', sort_field: 'flag.key' },
  { value: 'Action' },
];

const FlagModel = ({
  isOpen,
  closeModal,
  handleFlagChange,
  userData,
  flagData,
  setFlagData,
}: any) => {
  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[800px] m-4">
      <div className="no-scrollbar relative w-full max-w-[800px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-10">
        {/* Header */}
        <div className="mb-8">
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
            Change Task Flag
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Update the task details and flag status below.
          </p>
        </div>

        {/* Form Section */}
        <div className="custom-scrollbar max-h-[450px] overflow-y-auto space-y-6">
          {/* Flag Selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Flag
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              disabled={[ROLE.EMPLOYEE, ROLE.HR].includes(userData?.user_type)}
              value={flagData?.flag.key}
              onChange={(e) =>
                setFlagData((prev: any) => ({
                  ...prev,
                  flag: {
                    ...prev.flag,
                    key: e.target.value,
                  },
                }))
              }
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.code}
                </option>
              ))}
            </select>
          </div>
          {/* Task Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason
            </label>
            <textarea
              value={flagData?.flag.value}
              rows={6}
              placeholder="Enter your flag change reason..."
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              onChange={(e) =>
                setFlagData((prev: any) => ({
                  ...prev,
                  flag: {
                    ...prev.flag,
                    value: e.target.value,
                  },
                }))
              }
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-end">
          {/* <Button
            name="Close"
            size="sm"
            variant="outline"
            /> */}
          <AnimatedButton
            variant="secondary"
            size="sm"
            onClick={closeModal}
            className="w-full sm:w-fit"
          >
            Close
          </AnimatedButton>
          <AnimatedButton
            variant="primary"
            size="md"
            className="w-full sm:w-fit"
            onClick={() => handleFlagChange(flagData)}
          >
            Save Changes
          </AnimatedButton>
        </div>
      </div>
    </Modal>
  );
};

export default function TaskList() {
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isStatusOpen,
    openModal: openStatusModal,
    closeModal: closeStatusModal,
  } = useModal();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userData: any = useAppSelector((state) => state?.user);

  const [listData, setListData] = useState([]);
  type TaskType = {
    _id: string;
    status?: any;
    // add other properties as needed
  };

  const [task, setTask] = useState<TaskType | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [flagData, setFlagData] = useState(null);
  const [pageData, setPageData] = useState({
    totalPages: 0,
    totalRecords: 0,
  });
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isLoading, setIsLoadingState] = useState(false);
  const [payload, setPayload] = useState({
    search: '',
    page: 1,
    limit: 10,
    sort: 'desc',
    sort_field: 'updatedAt',
    project_id: '',
    assigned_to: '',
  });

  const handleFetchTask = async () => {
    try {
      if (isFirstLoad) {
        setIsLoadingState(true);
      }
      const { data } = await apiHandler.TaskHandler.list(payload);
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

  useEffect(() => {
    if (payload?.search) {
      const debounceTimer = setTimeout(() => {
        handleFetchTask();
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      handleFetchTask();
    }
  }, [
    payload?.search,
    payload?.limit,
    payload?.page,
    payload?.sort,
    payload?.sort_field,
    payload?.project_id,
    payload?.assigned_to,
  ]);

  const handleOnView = (item: any) => {
    navigate(`/tasks/create?action=view&id=${item?._id}`);
  };

  const handleOnDelete = async (item: any) => {
    try {
      dispatch(setIsLoading(true));

      const { data } = await apiHandler.TaskHandler.delete(item?._id);
      showToast('success', data?.message);
      handleFetchTask();
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleOnEdit = (item: any) => {
    navigate(`/tasks/create?action=edit&id=${item?._id}`);
  };

  const formatValue = (value: any, fieldName: string) => {
    if (!value) return '-';

    if (fieldName.toLowerCase().includes('date')) {
      return moment(value).format('DD/MM/YYYY');
    }

    if (Array.isArray(value)) {
      return value.map((item) => item.full_name).join(', ');
    }

    return value.toString();
  };

  const handleFetchDropdownChange = useCallback((name: string, value: any) => {
    setPayload((prev) => ({ ...prev, [name]: value?._id || '' }));
  }, []);

  const filterArr = [
    userData?.user_type === ROLE.ADMIN && (
      <Select
        endPoints={apiHandler.userHandler.lookup}
        filterStr={`user_type=`}
        value={payload.assigned_to}
        display="full_name"
        objKey="assigned_to"
        placeholder="Select User"
        func={handleFetchDropdownChange}
        disableClearable={false}
      />
    ),
    <Select
      endPoints={apiHandler.ProjectHandler.lookup}
      filterStr={`value=`}
      value={payload.project_id}
      display="name"
      objKey="project_id"
      placeholder="Select Project"
      func={handleFetchDropdownChange}
      disableClearable={false}
    />,
  ].filter(Boolean);

  const getValue = (obj: any, path: string): any =>
    path?.split('.').reduce((acc, key) => acc?.[key], obj);

  const handleFlagChange = async (item: any) => {
    const updatedData: any = listData.map((row: any) =>
      row?._id === item?._id ? { ...row, flag: item?.flag } : row,
    );
    setListData(updatedData);

    const { data } = await apiHandler.TaskHandler.update(item?._id, {
      flag: item.flag,
    });
    showToast('success', data?.message);
    handleFetchTask();
    closeModal();
  };

  const handleFlagModel = (item: any) => {
    setFlagData(item);
    openModal();
  };

  const handleUpdateStatus = async () => {
    try {
      dispatch(setIsLoading(true));
      const { data, status } = await apiHandler.TaskHandler.updateStatus(
        task?._id,
        { status: task?.status },
      );
      if ([200, 201].includes(status)) {
        showToast('success', data?.message);
      } else {
        showToast('error', data?.message);
      }
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      handleFetchTask();
      closeStatusModal();
      dispatch(setIsLoading(false));
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Manage Task" />
      <div className="space-y-6">
        <FlagModel
          isOpen={isOpen}
          closeModal={closeModal}
          handleFlagChange={handleFlagChange}
          userData={userData}
          flagData={flagData}
          setFlagData={setFlagData}
        />
        <Modal
          isOpen={isStatusOpen}
          onClose={() => closeStatusModal()}
          className="max-w-[650px] p-4"
        >
          <div className="flex flex-col gap-4">
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
              Select Project
            </Label>
            <div>
              <Select
                endPoints={apiHandler.lookupValueHandler.lookupValue}
                filterStr={`value_code=TASK_STATUS`}
                placeholder="Select Status"
                value={task?.status?._id}
                objKey="status"
                display="name"
                func={(key: string, value: any) => {
                  setTask((prev) => {
                    if (!prev) return null;
                    return { ...prev, [key]: value };
                  });
                }}
              />
            </div>
            <AnimatedButton
              variant="primary"
              size="md"
              onClick={handleUpdateStatus}
              className="w-full sm:w-fit"
            >
              Save
            </AnimatedButton>
          </div>
        </Modal>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <SearchBox
            payload={payload}
            setPayload={setPayload}
            onClick={() => navigate('/tasks/create')}
            filterArr={filterArr}
            currentRole={userData?.user_type}
            permission={[ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.HR]}
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
                                item?.value !== 'Assign To' &&
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
                              {item?.value !== 'Action' &&
                                item?.value !== 'Assign To' && (
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
                            const cellValue = getValue(item, col.sort_field!);
                            const formattedValue = formatValue(
                              cellValue,
                              col?.value,
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
                                      handleOnDelete={() =>
                                        handleOnDelete(item)
                                      }
                                      handleOnEdit={() => handleOnEdit(item)}
                                      currentRole={userData?.user_type}
                                      permissions={taskPermissions}
                                      customAction={
                                        <button
                                          onClick={() => {
                                            setTask(item);
                                            openStatusModal();
                                          }}
                                          className="w-fit px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm text-nowrap"
                                        >
                                          Status
                                        </button>
                                      }
                                    />
                                  </div>
                                ) : col.value === 'Flag' ? (
                                  <>
                                    <div
                                      onClick={() => handleFlagModel(item)}
                                      onMouseEnter={() =>
                                        setHoveredItemId(item._id)
                                      }
                                      onMouseLeave={() =>
                                        setHoveredItemId(null)
                                      }
                                      className="relative inline-block cursor-pointer"
                                    >
                                      <Badge
                                        size="md"
                                        color={
                                          statusColorMap[formattedValue] ?? ''
                                        }
                                      >
                                        {formattedValue}
                                      </Badge>
                                      {hoveredItemId === item._id &&
                                        item?.flag?.value && (
                                          <div className="absolute -left-10 z-10 p-3 min-w-[200px] flex flex-wrap gap-2 rounded-lg bg-white shadow-lg border dark:bg-gray-800">
                                            <span className="rounded-full text-gray-800 py-1 text-xs font-medium dark:text-white">
                                              {item?.flag?.value}
                                            </span>
                                          </div>
                                        )}
                                    </div>
                                  </>
                                ) : col.value === 'Status' ? (
                                  <Badge
                                    size="md"
                                    color={statusColorMap[formattedValue] ?? ''}
                                  >
                                    {formattedValue}
                                  </Badge>
                                ) : col.value === 'Assign To' ? (
                                  <AssignToBadges
                                    names={cellValue}
                                    label="full_name"
                                  />
                                ) : (
                                  <p className="text-wrap">{formattedValue}</p>
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
            setPayload={setPayload}
            totalEntries={pageData?.totalRecords}
            totalPages={pageData?.totalPages}
            page={payload?.page}
          />
        </div>
      </div>
    </>
  );
}
