import { ChevronsUpDown } from 'lucide-react';
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

const CountryList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [lookupList, setLookupList] = useState([]);
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
  });

  const handleFetchCountry = async () => {
    try {
      if (isFirstLoad) {
        setIsLoadingState(true);
      }
      const { data } = await apiHandler.countryHandler.list(payload);
      setLookupList(data?.data?.data);
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

  const handleOnView = (item: any) => {
    navigate(`/country/create?action=view&id=${item?._id}`);
  };

  const handleOnDelete = async (item: any) => {
    try {
      dispatch(setIsLoading(true));

      const { data } = await apiHandler.countryHandler.delete(item?._id);
      showToast('success', data?.message);
      handleFetchCountry();
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleOnEdit = (item: any) => {
    navigate(`/country/create?action=edit&id=${item?._id}`);
  };

  useEffect(() => {
    if (payload?.search) {
      const debounceTimer = setTimeout(() => {
        handleFetchCountry();
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      handleFetchCountry();
    }
  }, [
    payload?.search,
    payload?.limit,
    payload?.page,
    payload?.sort,
    payload?.sort_field,
  ]);

  const TableCellData = [
    { value: 'Name', sort_field: 'name' },
    { value: 'Action' },
  ];

  return (
    <>
      <PageBreadcrumb pageTitle="Country Management" />
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <SearchBox
            payload={payload}
            setPayload={setPayload}
            onClick={() => navigate('/country/create')}
            currentRole={ROLE.ADMIN}
            permission={[ROLE.ADMIN]}
          />
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[500px] xl:min-w-[1102px]">
              {isLoading ? (
                <TableSkeleton rows={10} columns={TableCellData.length} />
              ) : (
                <>
                  <Table>
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow className="xl:grid xl:grid-cols-2">
                        {TableCellData.map((item, index) => (
                          <TableCell
                            key={index}
                            isHeader
                            className="px-5 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
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
                      {lookupList?.map((item: any) => (
                        <TableRow
                          key={item?._id}
                          className="xl:grid xl:grid-cols-2"
                        >
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {item?.name}
                          </TableCell>
                          <TableCell className="px-4 !w-[14px] py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
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
                  {lookupList.length === 0 && <NoData />}
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
};

export default CountryList;
