import { ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { ROLE } from '../../../utils/Constant';
import { getValue, showToast, statusColorMap } from '../../../utils/helper';
import { commonPermissions } from '../../../utils/permissions';
import ActionButton from '../../common/ActionButton';
import NoData from '../../common/NoData';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import Pagination from '../../common/Pagination';
import SearchBox from '../../common/SearchBox';
import { TableSkeleton } from '../../ui/LoadingSkeleton';
import Badge from '../../ui/badge/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';

export default function ProjectModule() {
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
      const { data } = await apiHandler.ProjectHandler.list(payload);
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
    navigate(`/project/create?action=view&id=${item?._id}`);
  };

  const handleOnDelete = async (item: any) => {
    try {
      dispatch(setIsLoading(true));

      const { data } = await apiHandler.ProjectHandler.delete(item?._id);
      showToast('success', data?.message);
      handleFetchEmployee();
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleOnEdit = (item: any) => {
    navigate(`/project/create?action=edit&id=${item?._id}`);
  };

  const TableCellData = [
    { value: 'Name', sort_field: 'name' },
    { value: 'Estimated Hours', sort_field: 'estimated_hours' },
    { value: 'Available  Hours', sort_field: 'available_hours' },
    { value: 'Estimated Budget', sort_field: 'estimated_budget' },
    { value: 'Available Budget', sort_field: 'available_budget' },
    { value: 'Status', sort_field: 'status.name' },
    { value: 'Flag', sort_field: 'flag' },
    { value: 'Action' },
  ];

  const handleDownloadPdf = async (item: any) => {
    try {
      dispatch(setIsLoading(true));
      const response = await apiHandler.ProjectHandler.downloadPdf(item?._id, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${item?.name}-project-details.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleViewDetails = (item: any) => {
    navigate(`/project/view-details?id=${item?._id}`);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Project Management" />
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <SearchBox
            payload={payload}
            setPayload={setPayload}
            currentRole={ROLE.ADMIN}
            permission={[ROLE.ADMIN]}
            onClick={() => navigate('/project/create')}
          />
          <div className="max-w-full overflow-auto">
            <div className="min-w-[1102px] max-h-[550px] divide-y">
              {isLoading ? (
                <TableSkeleton rows={10} columns={8} />
              ) : (
                <>
                  <Table>
                    <TableHeader className="border-b border-gray-200 dark:border-gray-700">
                      <TableRow>
                        {TableCellData.map((item, index) => (
                          <TableCell
                            key={index}
                            isHeader
                            className="px-4 py-3 font-semibold text-gray-800 text-start text-sm dark:text-gray-200"
                          >
                            <div
                              className="flex gap-1 items-center select-none cursor-pointer hover:text-primary-500 transition-colors"
                              onClick={() =>
                                item?.value !== 'Action' &&
                                item?.value !== 'Flag' &&
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
                                item?.value !== 'Flag' && (
                                  <ChevronsUpDown className="size-3.5" />
                                )}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {listData?.map((item: any, rowIndex) => (
                        <TableRow
                          key={item?._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 animate-fadeInUp"
                          style={{ animationDelay: `${rowIndex * 50}ms` }}
                        >
                          {TableCellData.map((col, idx) => {
                            const cellValue = getValue(item, col.sort_field!);

                            return (
                              <TableCell
                                key={idx}
                                className="px-4 py-3 text-gray-700 text-start text-sm dark:text-gray-300"
                              >
                                {col.value === 'Action' ? (
                                  <div className="flex justify-start">
                                    <ActionButton
                                      handleOnView={() => handleOnView(item)}
                                      handleOnDelete={() =>
                                        handleOnDelete(item)
                                      }
                                      handleOnEdit={() => handleOnEdit(item)}
                                      handleDownloadPdf={() =>
                                        handleDownloadPdf(item)
                                      }
                                      handleViewDetails={() =>
                                        handleViewDetails(item)
                                      }
                                      currentRole={ROLE.ADMIN}
                                      permissions={commonPermissions}
                                    />
                                  </div>
                                ) : col.value === 'Status' ||
                                  col.value === 'Flag' ? (
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
