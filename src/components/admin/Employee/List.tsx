import { ChevronsUpDown } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { ROLE } from '../../../utils/Constant';
import { showToast } from '../../../utils/helper';
import { commonPermissions } from '../../../utils/permissions';
import ActionButton from '../../common/ActionButton';
import NoData from '../../common/NoData';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import Pagination from '../../common/Pagination';
import SearchBox from '../../common/SearchBox';
import { TableSkeleton } from '../../ui/LoadingSkeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';

export default function EmployeeList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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
    sort_field: 'updatedAt',
  });

  const handleFetchEmployee = async () => {
    try {
      if (isFirstLoad) {
        setIsLoadingState(true);
      }
      const { data } = await apiHandler.userHandler.list(
        payload,
        `user_type=${ROLE.EMPLOYEE},${ROLE.BDE},${ROLE.HR}`,
      );
      setListData(data?.data?.data);
      setPageData({
        ...pageData,
        totalPages: data?.data?.totalPages,
        totalRecords: data?.data?.totalRecords,
      });
      setIsFirstLoad(false);
    } catch (error: any) {
      showToast('error', error?.message);
      console.log('Error:', error.message);
    } finally {
      setIsLoadingState(false);
    }
  };

  useEffect(() => {
    if (payload?.search) {
      const debounceTimer = setTimeout(() => {
        handleFetchEmployee();
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      handleFetchEmployee();
    }
  }, [
    payload?.search,
    payload?.limit,
    payload?.page,
    payload?.sort,
    payload?.sort_field,
  ]);

  const handleOnView = (item: any) => {
    navigate(`/employees/create?action=view&id=${item?._id}`);
  };

  const handleOnDelete = async (item: any) => {
    try {
      dispatch(setIsLoading(true));

      const { data } = await apiHandler.userHandler.delete(item?._id);
      showToast('success', data?.message);
      handleFetchEmployee();
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleOnEdit = (item: any) => {
    navigate(`/employees/create?action=edit&id=${item?._id}`);
  };

  const TableCellData = [
    { value: 'Name', sort_field: 'full_name' },
    { value: 'Company Email', sort_field: 'company_email' },
    { value: 'Personal Email', sort_field: 'personal_email' },
    { value: 'Mobile Number', sort_field: 'phone_number' },
    { value: 'Joining Date', sort_field: 'joining_date' },
    { value: 'Action' },
  ];

  return (
    <>
      <PageBreadcrumb pageTitle="Manage Employee" />
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <SearchBox
            payload={payload}
            setPayload={setPayload}
            onClick={() => navigate('/employees/create')}
            currentRole={ROLE.ADMIN}
            permission={[ROLE.ADMIN]}
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
                            className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400 sticky"
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
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 overflow-hidden rounded-full">
                                <img
                                  onError={(e: any) => {
                                    e.target.src = '/images/logo/banner.png';
                                  }}
                                  width={40}
                                  height={40}
                                  src={
                                    item?.profile_picture?.doc_path ||
                                    '/images/logo/banner.png'
                                  }
                                  alt="Profile"
                                  className="object-cover w-10 h-10 rounded-full"
                                />
                              </div>
                              <div>
                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                  {item?.full_name}
                                </span>
                                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                  {item?.designation?.name}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {item?.company_email}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {item?.personal_email}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {item?.phone_number}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {moment(item?.joining_date).format('DD MMM, YYYY')}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 flex justify-center text-theme-sm dark:text-gray-400">
                            <ActionButton
                              handleOnView={() => handleOnView(item)}
                              handleOnDelete={() => handleOnDelete(item)}
                              handleOnEdit={() => handleOnEdit(item)}
                              currentRole={ROLE.ADMIN}
                              permissions={commonPermissions}
                            />
                          </TableCell>
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
