import { ChevronsUpDown } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { apiHandler } from '../../../api/apiHandler';
import { useAppSelector } from '../../../redux/hooks';
import { ROLE } from '../../../utils/Constant';
import { showToast } from '../../../utils/helper';
import NoData from '../../common/NoData';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import Pagination from '../../common/Pagination';
import SearchBox from '../../common/SearchBox';
import { TableSkeleton } from '../../ui/LoadingSkeleton';
import { Modal } from '../../ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';

const TableCellData = [
  { value: 'Date', sort_field: 'createdAt' },
  { value: 'Connection Type', sort_field: 'form_type' },
  { value: 'User Name', sort_field: 'name' },
  { value: 'Designation', sort_field: 'designation' },
  { value: 'Company Name', sort_field: 'company_name' },
  { value: 'Email', sort_field: 'email' },
  { value: 'Contact Number', sort_field: 'phone_number' },
  { value: 'Message', sort_field: 'message' },
];

const ContactUsList = () => {
  const userData: any = useAppSelector((state) => state?.user);

  const [listData, setListData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(null);
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
    sort_field: 'createdAt',
  });

  const handleFetchData = async () => {
    try {
      if (isFirstLoad) {
        setIsLoadingState(true);
      }
      const { data } = await apiHandler.authHandler.contactUsList(payload);
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
        handleFetchData();
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      handleFetchData();
    }
  }, [
    payload?.search,
    payload?.limit,
    payload?.page,
    payload?.sort,
    payload?.sort_field,
  ]);

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
    <div>
      <PageBreadcrumb pageTitle="Contact Us" />
      <MessageViewModel
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        message={message}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <SearchBox
          add={false}
          payload={payload}
          setPayload={setPayload}
          currentRole={userData?.user_type}
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
                              {col.value === 'Message' ? (
                                <p
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setMessage(cellValue);
                                    setIsOpen(true);
                                  }}
                                >
                                  {cellValue?.slice(0, 50)}...
                                </p>
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
  );
};

export default ContactUsList;

const MessageViewModel = ({ isOpen, closeModal, message }: any) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="max-w-[700px] m-4 rounded-2xl shadow-lg bg-white dark:bg-gray-900 p-6"
    >
      <p className="underline text-primary-800">Message:</p>
      <p className="mt-8 min-h-32">{message}</p>
    </Modal>
  );
};
