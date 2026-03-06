import { ChevronsUpDown } from 'lucide-react';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiHandler } from '../../../api/apiHandler';
import { ROLE } from '../../../utils/Constant';
import { getValue, showToast } from '../../../utils/helper';
import { commonPermissions } from '../../../utils/permissions';
import ActionButton from '../../common/ActionButton';
import ImportExcel from '../../common/ImportExcel';
import NoData from '../../common/NoData';
import PageBreadcrumb from '../../common/PageBreadCrumb';
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

const RecruitmentHubList = () => {
  const navigate = useNavigate();

  const [listData, setListData] = useState([]);
  const [openExcelModel, setOpenExcelModel] = useState(false);
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
    vertical: '',
  });

  const handleFetchData = async () => {
    try {
      if (isFirstLoad) {
        setIsLoadingState(true);
      }
      const { data } = await apiHandler.RecruitmentHubHandler.list(payload);
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
    payload?.vertical,
  ]);

  // const handleOnView = (item: any) => {
  //   navigate(`/recruitment-hub/create?action=view&id=${item?._id}`);
  // };

  const handleOnDelete = async (item: any) => {
    try {
      const { data } = await apiHandler.RecruitmentHubHandler.delete(item?._id);
      showToast('success', data?.message);
      handleFetchData();
    } catch (error: any) {
      showToast('error', error?.message);
    }
  };

  const handleOnEdit = (item: any) => {
    navigate(`/recruitment-hub/create?action=edit&id=${item?._id}`);
  };

  const TableCellData = [
    { value: 'Date', sort_field: 'date' },
    { value: 'Candidates Name', sort_field: 'candidate_name' },
    { value: 'Designation', sort_field: 'designation' },
    { value: 'Email', sort_field: 'email' },
    { value: 'Contact Number', sort_field: 'contact_number' },
    { value: 'Action' },
  ];

  const handleFetchDropdownChange = useCallback((name: string, value: any) => {
    setPayload((prev) => ({ ...prev, [name]: value?._id || '' }));
  }, []);

  const handleImportToExcel = () => {
    setOpenExcelModel(true);
  };

  const filterArr = [
    <Select
      endPoints={apiHandler.lookupValueHandler.lookupValue}
      filterStr={`value_code=VERTICAL`}
      placeholder="Select Vertical"
      value={payload.vertical}
      objKey="vertical"
      display="name"
      func={handleFetchDropdownChange}
      disableClearable={false}
    />,
  ];

  const handleViewCV = (item: any) => {
    if (item?.resume) {
      window.open(item?.resume?.doc_path, '_blank');
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Recruitment Hub" />

      <ImportExcel
        isOpen={openExcelModel}
        closeModal={() => setOpenExcelModel(false)}
        handleFetchData={handleFetchData}
        endPoint={apiHandler.RecruitmentHubHandler.importExcel}
      />

      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <SearchBox
            payload={payload}
            setPayload={setPayload}
            onClick={() => navigate('/recruitment-hub/create')}
            currentRole={ROLE.ADMIN}
            permission={[ROLE.ADMIN]}
            filterArr={filterArr}
            handleImportToExcel={handleImportToExcel}
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
                            const cellValue = getValue(item, col.sort_field!);

                            return (
                              <TableCell
                                key={idx}
                                className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                              >
                                {col.value === 'Action' ? (
                                  <div className="flex justify-start">
                                    <ActionButton
                                      // handleOnView={() => handleOnView(item)}
                                      handleOnDelete={() =>
                                        handleOnDelete(item)
                                      }
                                      handleOnEdit={() => handleOnEdit(item)}
                                      handleViewCV={() => handleViewCV(item)}
                                      currentRole={ROLE.ADMIN}
                                      permissions={commonPermissions}
                                    />
                                  </div>
                                ) : col.value === 'Date' ? (
                                  <p>
                                    {moment(cellValue).format('DD-MM-YYYY')}
                                  </p>
                                ) : col.value === 'Contact Number' ? (
                                  <p>
                                    {cellValue
                                      ?.toString()
                                      ?.trim()
                                      ?.slice(0, 10) || '-'}
                                  </p>
                                ) : (
                                  <p>
                                    {cellValue ? cellValue?.toString() : '-'}
                                  </p>
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
};

export default RecruitmentHubList;
