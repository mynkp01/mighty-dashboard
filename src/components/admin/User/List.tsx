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

export default function UserList() {
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

  const handleFetchUsers = async () => {
    try {
      if (isFirstLoad) {
        setIsLoadingState(true);
      }
      const { data } = await apiHandler.userHandler.list(
        payload,
        `user_type=${ROLE.ADMIN}`,
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
    } finally {
      setIsLoadingState(false);
    }
  };

  useEffect(() => {
    if (payload?.search) {
      const debounceTimer = setTimeout(() => {
        handleFetchUsers();
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      handleFetchUsers();
    }
  }, [
    payload?.search,
    payload?.limit,
    payload?.page,
    payload?.sort,
    payload?.sort_field,
  ]);

  const tableCellData = [
    { value: 'Name', sort_field: 'name' },
    { value: 'Company Email', sort_field: 'company_email' },
    { value: 'Personal Email', sort_field: 'personal_email' },
    { value: 'Contact Number', sort_field: 'phone_number' },
    { value: 'Date of Birth', sort_field: 'date_of_birth' },
  ];

  const handleOnView = (item: any) => {
    navigate(`/users/create?action=view&id=${item?._id}`);
  };

  const handleOnDelete = async (item: any) => {
    try {
      dispatch(setIsLoading(true));

      const { data } = await apiHandler.userHandler.delete(item?._id);
      showToast('success', data?.message);
      handleFetchUsers();
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleOnEdit = (item: any) => {
    navigate(`/users/create?action=edit&id=${item?._id}`);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="User Management" />
      <div className="space-y-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <SearchBox
          payload={payload}
          setPayload={setPayload}
          onClick={() => navigate('/users/create')}
          data={listData}
          currentRole={ROLE.ADMIN}
          permission={[ROLE.ADMIN]}
        />
        <div className="max-w-full overflow-auto">
          <div className="min-w-[1102px] max-h-[550px] divide-y">
            {isLoading ? (
              <TableSkeleton rows={10} columns={6} />
            ) : (
              <>
                <Table>
                  {/* Table Header */}
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      {tableCellData.map((item, index) => (
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
                                sort: payload.sort === 'desc' ? 'asc' : 'desc',
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
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHeader>
                  {/* Table Body */}
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {listData?.map((item: any) => (
                      <TableRow key={item?._id}>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item?.full_name}
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
                          {item?.date_of_birth
                            ? moment(item?.date_of_birth).format('DD/MM/YYYY')
                            : ''}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 flex justify-start text-theme-sm dark:text-gray-400">
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
    </>
  );
}
