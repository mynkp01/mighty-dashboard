import { ChevronsUpDown } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setUserForCrm } from '../../../redux/slices/userForCrmSlice';
import { ROLE } from '../../../utils/Constant';
import { getValue, isEmpty, showToast } from '../../../utils/helper';
import { crmPermissions } from '../../../utils/permissions';
import ActionButton from '../../common/ActionButton';
import NoData from '../../common/NoData';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import Pagination from '../../common/Pagination';
import AssignToBadges from '../../ui/badge/AssignToBadges';
import DetailsPopover from '../../ui/DetailsPopover';
import { TableSkeleton } from '../../ui/LoadingSkeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import ChangeCRMStatusModal from './ChangeCRMStatusModal';
import CrmSearchBox from './CrmSearchBox';

const CrmPipelineUsersList = () => {
  const TableCellData = [
    { value: 'CRM Type', sort_field: 'crm_type.name' },
    { value: 'CRM Sub Type', sort_field: 'crm_sub_type.name' },
    { value: 'Company Name', sort_field: 'crm_base_id.company_name' },
    {
      value: 'Location',
      sort_field: 'crm_base_id.country.name,crm_base_id.city.name',
    },
    { value: 'Clients Name', sort_field: 'crm_base_id.clients_name' },
    { value: 'Assigned To', sort_field: 'users' },
    { value: 'Website', sort_field: 'crm_base_id.website' },
    { value: 'Last Updated Date', sort_field: 'updatedAt', isDate: true },
    { value: 'Created Date', sort_field: 'createdAt', isDate: true },
    { value: 'Verticals', sort_field: 'crm_base_id.vertical.name' },
    { value: 'Action' },
  ];

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const dispatch = useAppDispatch();
  const crmUserData: any = useAppSelector(
    (state) => state.userForCrm?.userForCrm,
  );
  const userData: any = useAppSelector((state) => state.user);

  const [listData, setListData] = useState([]);
  // const [openExcelModel, setOpenExcelModel] = useState(false);
  const [pipelineItem, setPipelineItem] = useState(null);
  const [changeLeadStatusModal, setChangeLeadStatusModal] = useState(false);
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
  const [payload, setPayload] = useState({
    search: '',
    page: 1,
    limit: 10,
    sort: 'desc',
    sort_field: 'updatedAt',
    country: [],
    city: [],
    crm_type: [],
    crm_sub_type: [],
    vertical: [],
    type: 'monthly',
    startDate: moment().subtract(1, 'month').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
  });

  const handleFetchData = async () => {
    try {
      if (isFirstLoad) {
        setIsLoadingState(true);
      }
      const { data } = await apiHandler.crmHandler.mainList({
        ...payload,
        user_id: crmUserData,
      });
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
    } else if (
      payload.type !== 'custom' ||
      (!isEmpty(payload.startDate) && !isEmpty(payload.endDate))
    ) {
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
    payload?.crm_type,
    payload?.crm_sub_type,
    payload?.vertical,
    payload?.type,
    payload?.startDate,
    payload?.endDate,
    crmUserData,
  ]);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());

    if (!isEmpty(params)) {
      const newPayload: any = { ...payload };
      Object.entries(params).forEach(([key, value]) => {
        if (key === 'user_id') {
          dispatch(setUserForCrm(value.split(',')));
        } else if (
          ['country', 'city', 'crm_type', 'crm_sub_type', 'vertical'].includes(
            key,
          )
        ) {
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
      if (!isEmpty(crmUserData)) {
        newParams.set('user_id', crmUserData.toString());
      }
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

    if (!isEmpty(crmUserData)) {
      newParams.set('user_id', crmUserData.toString());
    }

    setSearchParams(newParams, { replace: true });
  }, [payload, crmUserData]);

  // const handleImportToExcel = () => {
  //   setOpenExcelModel(true);
  // };

  const handleChangeCrmType = (item: any) => {
    setChangeLeadStatusModal(true);
    setPipelineItem(item);
  };

  const companyOpen = Boolean(companyAnchorEl);
  const clientOpen = Boolean(clientAnchorEl);
  const companyId = companyOpen ? 'company-details-popover' : undefined;
  const clientId = clientOpen ? 'client-details-popover' : undefined;

  return (
    <>
      <PageBreadcrumb pageTitle="CRM Management ( Clients )" />

      {/* <ImportExcel
        isOpen={openExcelModel}
        closeModal={() => setOpenExcelModel(false)}
        handleFetchData={handleFetchData}
        endPoint={apiHandler.crmHandler.importExcel}
      /> */}

      {changeLeadStatusModal && (
        <ChangeCRMStatusModal
          handleFetchData={handleFetchData}
          item={pipelineItem}
          isOpen={changeLeadStatusModal}
          closeModal={() => setChangeLeadStatusModal(false)}
        />
      )}

      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <CrmSearchBox
            payload={payload}
            placeholder="Search by company..."
            setPayload={setPayload}
            onClick={() => navigate('/crm/clients/create')}
            add={false}
            currentRole={userData?.user_type}
            permission={[ROLE.ADMIN, ROLE.BDE]}
            isLoading={isLoading}
            // handleImportToExcel={handleImportToExcel}
            handleResetFilters={() => {
              const initialPayload: Record<string, any> = {};

              Object.keys(payload)
                .filter(
                  (key) =>
                    ![
                      'startDate',
                      'endDate',
                      'sort',
                      'type',
                      'sort_field',
                      'page',
                      'limit',
                    ].includes(key),
                )
                .forEach((key) => {
                  initialPayload[key] = Array.isArray((payload as any)[key])
                    ? []
                    : '';
                });
              setPayload((prev) => ({ ...prev, ...initialPayload }));
              dispatch(setUserForCrm([]));
            }}
            showResetFilterButton={
              Object.entries(payload)
                .filter(
                  ([key]) =>
                    ![
                      'startDate',
                      'endDate',
                      'sort',
                      'type',
                      'sort_field',
                      'page',
                      'limit',
                    ].includes(key),
                )
                .some(([, value]) =>
                  Array.isArray(value) ? value.length > 0 : value !== '',
                ) || !isEmpty(crmUserData)
            }
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
                                      handleAttachment={() =>
                                        navigate(
                                          `/crm/pipeline/attachment?id=${item?._id}`,
                                        )
                                      }
                                      customAction={
                                        <button
                                          onClick={() =>
                                            handleChangeCrmType(item)
                                          }
                                          className="w-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-sm text-nowrap"
                                        >
                                          Change Status
                                        </button>
                                      }
                                      currentRole={userData?.user_type}
                                      permissions={crmPermissions}
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
                                ) : col.value === 'Assigned To' ? (
                                  !isEmpty(cellValue) ? (
                                    <AssignToBadges
                                      names={cellValue}
                                      label="full_name"
                                      openLink
                                    />
                                  ) : (
                                    <p>Not Assigned</p>
                                  )
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

export default CrmPipelineUsersList;
