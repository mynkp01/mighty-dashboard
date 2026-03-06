import { ChevronsUpDown } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { apiHandler } from '../../../api/apiHandler';
import { useAppSelector } from '../../../redux/hooks';
import { ROLE } from '../../../utils/Constant';
import { getValue, isEmpty, showToast } from '../../../utils/helper';
import { crmPermissions } from '../../../utils/permissions';
import ActionButton from '../../common/ActionButton';
import ImportExcel from '../../common/ImportExcel';
import NoData from '../../common/NoData';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import Pagination from '../../common/Pagination';
import DetailsPopover from '../../ui/DetailsPopover';
import { TableSkeleton } from '../../ui/LoadingSkeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import ConvertToProspectModal from './ConvertToProspectModal';
import CrmSearchBox from './CrmSearchBox';

const CrmList = () => {
  const TableCellData = [
    { value: 'Company Name', sort_field: 'company_name' },
    { value: 'Location', sort_field: 'country.name,city.name' },
    { value: 'Clients Name', sort_field: 'clients_name' },
    { value: 'Website', sort_field: 'website' },
    { value: 'Last Updated Date', sort_field: 'updatedAt', isDate: true },
    { value: 'Created Date', sort_field: 'createdAt', isDate: true },
    { value: 'Verticals', sort_field: 'vertical.name' },
    { value: 'Action' },
  ];

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [crmItem, setCrmItem] = useState(null);
  const [listData, setListData] = useState([]);
  const [openExcelModel, setOpenExcelModel] = useState(false);
  const [convertToProspectModal, setConvertToProspectModal] = useState(false);
  const [companyAnchorEl, setCompanyAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const [clientAnchorEl, setClientAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const [popoverItem, setPopoverItem] = useState<any>(null);
  const [, setIsHoveringPopover] = useState(false);
  const [pageData, setPageData] = useState({
    totalPages: 0,
    totalRecords: 0,
  });
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isLoading, setIsLoadingState] = useState(false);
  const userData: any = useAppSelector((state) => state.user);
  const [payload, setPayload] = useState({
    search: '',
    page: 1,
    limit: 10,
    sort: 'desc',
    sort_field: 'updatedAt',
    country: [],
    city: [],
    vertical: [],
  });

  const handleFetchData = async () => {
    try {
      if (isFirstLoad) {
        setIsLoadingState(true);
      }
      const { data } = await apiHandler.crmHandler.list(payload);
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
    if (!isEmpty(payload?.search)) {
      const debounceTimer = setTimeout(() => {
        handleFetchData();
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      handleFetchData();
    }
  }, [
    payload?.search,
    payload?.page,
    payload?.limit,
    payload?.sort,
    payload?.sort_field,
    payload?.country,
    payload?.city,
    payload?.vertical,
  ]);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());

    if (!isEmpty(params)) {
      const newPayload: any = { ...payload };
      Object.entries(params)
        ?.filter(
          ([key]) =>
            ![
              'crm_type',
              'crm_sub_type',
              'startDate',
              'endDate',
              'type',
              'user_id',
            ].includes(key),
        )
        .forEach(([key, value]) => {
          if (['country', 'city', 'vertical'].includes(key)) {
            newPayload[key] = value.split(',');
          } else if (['page', 'limit'].includes(key)) {
            newPayload[key] = Number(value);
          } else {
            newPayload[key] = value;
          }
        });
      setPayload(newPayload);
    } else if (!isFirstLoad) {
      const newParams = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        if (
          value !== '' &&
          value !== null &&
          value !== undefined &&
          !isEmpty(value)
        ) {
          newParams.set(key, value.toString());
        }
      });
      if (newParams.toString()) {
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchParams, isFirstLoad]);

  useEffect(() => {
    const newParams = new URLSearchParams();

    Object.entries(payload).forEach(([key, value]) => {
      if (
        value !== '' &&
        value !== null &&
        value !== undefined &&
        !isEmpty(value)
      ) {
        newParams.set(key, value.toString());
      }
    });

    setSearchParams(newParams, { replace: true });
  }, [payload]);

  const handleOnView = (item: any) => {
    navigate(`/crm/clients/create?action=view&id=${item?._id}`);
  };

  const handleOnDelete = async (item: any) => {
    try {
      const { data } = await apiHandler.crmHandler.delete(item?._id);
      showToast('success', data?.message);
      handleFetchData();
    } catch (error: any) {
      showToast('error', error?.message);
    }
  };

  const handleOnEdit = (item: any) => {
    navigate(`/crm/clients/create?action=edit&id=${item?._id}`);
  };

  const handleChangeCrmType = (item: any) => {
    setConvertToProspectModal(true);
    setCrmItem(item);
  };

  const handleImportToExcel = () => {
    setOpenExcelModel(true);
  };

  const companyOpen = Boolean(companyAnchorEl);
  const clientOpen = Boolean(clientAnchorEl);
  const companyId = companyOpen ? 'company-details-popover' : undefined;
  const clientId = clientOpen ? 'client-details-popover' : undefined;

  return (
    <>
      <PageBreadcrumb pageTitle="CRM Management ( Clients )" />

      <ImportExcel
        isOpen={openExcelModel}
        closeModal={() => setOpenExcelModel(false)}
        handleFetchData={handleFetchData}
        endPoint={apiHandler.crmHandler.importExcel}
      />

      {convertToProspectModal && (
        <ConvertToProspectModal
          handleFetchData={handleFetchData}
          crmItem={crmItem}
          isOpen={convertToProspectModal}
          closeModal={() => setConvertToProspectModal(false)}
        />
      )}

      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <CrmSearchBox
            payload={payload}
            setPayload={setPayload}
            onClick={() => navigate('/crm/clients/create')}
            currentRole={userData?.user_type}
            permission={[ROLE.ADMIN, ROLE.BDE]}
            isLoading={isLoading}
            hideCrmTypeFilters={true}
            hideUserFilters={true}
            hideDateFilters={true}
            handleImportToExcel={handleImportToExcel}
            ignoreFiltersKeyFromCount={['type', 'user_id']}
            handleResetFilters={() => {
              const initialPayload: Record<string, any> = {};

              Object.keys(payload)
                .filter(
                  (key) =>
                    !['sort', 'sort_field', 'page', 'limit'].includes(key),
                )
                .forEach((key) => {
                  initialPayload[key] = Array.isArray((payload as any)[key])
                    ? []
                    : '';
                });
              setPayload((prev) => ({ ...prev, ...initialPayload }));
            }}
            showResetFilterButton={Object.entries(payload)
              .filter(
                ([key]) =>
                  !['sort', 'sort_field', 'page', 'limit'].includes(key),
              )
              .some(([, value]) => !isEmpty(value))}
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
                            className="px-4 py-3 whitespace-nowrap font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
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
                                <ChevronsUpDown className="size-3.5 min-h-3.5 min-w-3.5" />
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
                            const getCellValue = (
                              item: any,
                              sortField: string,
                            ) => {
                              if (!sortField) return '';
                              const multipleValues = sortField.split(',');
                              if (multipleValues.length > 1) {
                                const [country, city] = multipleValues.map(
                                  (field) => getValue(item, field),
                                );
                                return [country, city]
                                  .filter(Boolean)
                                  .join(', ');
                              }
                              return getValue(item, sortField);
                            };

                            const cellValue = getCellValue(
                              item,
                              col.sort_field!,
                            );

                            return (
                              <TableCell
                                key={idx}
                                className="px-4 whitespace-nowrap py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
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
                                      permissions={crmPermissions}
                                      customAction={
                                        <button
                                          onClick={() =>
                                            handleChangeCrmType(item)
                                          }
                                          className="w-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm text-nowrap"
                                        >
                                          Convert To Prospect
                                        </button>
                                      }
                                    />
                                  </div>
                                ) : col.value === 'Company Name' ? (
                                  <span
                                    aria-describedby={companyId}
                                    className={`rounded-full text-gray-800 px-3 py-1 text-xs font-medium cursor-pointer ${
                                      !isEmpty(cellValue) ? 'bg-gray-100' : ''
                                    }`}
                                    onMouseEnter={(e) => {
                                      if (!isEmpty(cellValue)) {
                                        setCompanyAnchorEl(e.currentTarget);
                                        setPopoverItem(item);
                                      }
                                    }}
                                  >
                                    {cellValue || '-'}
                                  </span>
                                ) : col.value === 'Clients Name' &&
                                  !isEmpty(cellValue) ? (
                                  <div className="flex flex-wrap gap-1">
                                    {cellValue?.map(
                                      (client: any, index: number) => (
                                        <span
                                          key={index}
                                          aria-describedby={clientId}
                                          className="rounded-full bg-gray-100 text-gray-800 px-3 py-1 text-xs font-medium cursor-pointer"
                                          onMouseEnter={(e) => {
                                            if (!isEmpty(client?.name)) {
                                              setClientAnchorEl(
                                                e.currentTarget,
                                              );
                                              setPopoverItem(client);
                                            }
                                          }}
                                        >
                                          {client?.name || '-'}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                ) : col.value === 'Website' ? (
                                  <Link
                                    to={cellValue || '#'}
                                    target={cellValue ? '_blank' : '_self'}
                                    rel="noopener noreferrer"
                                    className={`cursor-pointer text-blue-600 ${
                                      cellValue
                                        ? 'underline'
                                        : 'pointer-events-none'
                                    }`}
                                  >
                                    {cellValue ? 'View Site' : '-'}
                                  </Link>
                                ) : (
                                  <p>
                                    {col.isDate
                                      ? moment(cellValue).format(
                                          'DD-MM-YYYY, hh:mm A',
                                        )
                                      : !isEmpty(cellValue)
                                        ? cellValue?.toString()
                                        : '-'}
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

      <DetailsPopover
        id={companyId || ''}
        open={companyOpen}
        anchorEl={companyAnchorEl}
        onClose={() => setCompanyAnchorEl(null)}
        onMouseEnter={() => setIsHoveringPopover(true)}
        onMouseLeave={() => {
          setIsHoveringPopover(false);
          setCompanyAnchorEl(null);
          setPopoverItem(null);
        }}
        data={popoverItem}
        type="company"
      />

      <DetailsPopover
        id={clientId || ''}
        open={clientOpen}
        anchorEl={clientAnchorEl}
        onClose={() => setClientAnchorEl(null)}
        onMouseEnter={() => setIsHoveringPopover(true)}
        onMouseLeave={() => {
          setIsHoveringPopover(false);
          setClientAnchorEl(null);
          setPopoverItem(null);
        }}
        data={popoverItem}
        type="client"
      />
    </>
  );
};

export default CrmList;
