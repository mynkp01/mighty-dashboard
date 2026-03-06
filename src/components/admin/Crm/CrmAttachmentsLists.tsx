import { Popover } from '@mui/material';
import { ChevronsUpDown } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
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
import CrmSearchBox from './CrmSearchBox';

const CrmAttachmentsLists = () => {
  const TableCellData = [
    {
      value: 'Next Approach Date',
      sort_field: 'next_approach_date',
      isDate: true,
    },
    {
      value: 'Location',
      sort_field:
        'crm_main_id.crm_base_id.country.name,crm_main_id.crm_base_id.city.name',
    },
    { value: 'Date', sort_field: 'date', isDate: true },
    { value: 'CRM Type', sort_field: 'crm_main_id.crm_type.name' },
    {
      value: 'CRM Sub Type',
      sort_field: 'crm_main_id.crm_sub_type.name',
    },
    {
      value: 'Clients Name',
      sort_field: 'crm_main_id.crm_base_id.clients_name',
    },
    { value: 'Assigned To', sort_field: 'crm_main_id.users' },
    { value: 'Members', sort_field: 'members' },
    { value: 'Verticals', sort_field: 'crm_main_id.crm_base_id.vertical.name' },
    { value: 'Attachments', sort_field: 'attachment' },
    { value: 'Attachment Type', sort_field: 'attachment_type.name' },
    { value: 'Notes', sort_field: 'notes' },
    { value: 'Action' },
  ];

  const dispatch = useAppDispatch();
  const crmUserData: any = useAppSelector(
    (state) => state.userForCrm?.userForCrm,
  );
  const userData: any = useAppSelector((state) => state.user);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [attachmentAnchorEl, setAttachmentAnchorEl] =
    useState<HTMLElement | null>(null);
  const [clientAnchorEl, setClientAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [popoverItem, setPopoverItem] = useState<any>(null);
  const [, setIsHoveringPopover] = useState(false);
  const [attachmentListData, setAttachmentListData] = useState([]);
  const [pageData, setPageData] = useState({ totalPages: 0, totalRecords: 0 });
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

  useEffect(() => {
    if (!isEmpty(payload?.search)) {
      const debounceTimer = setTimeout(() => {
        handleFetchData();
      }, 500);
      return () => clearTimeout(debounceTimer);
    } else if (
      payload.type === 'custom' &&
      isEmpty(payload.startDate) &&
      isEmpty(payload.endDate)
    ) {
      return;
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
    } else {
      // If no URL params, update URL with current payload to preserve filters
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
  }, [searchParams]);

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

  const handleFetchData = async () => {
    try {
      if (isFirstLoad) {
        setIsLoadingState(true);
      }
      const { data } = await apiHandler.crmHandler.attachmentListWithPagination(
        { ...payload, user_id: crmUserData },
      );

      setAttachmentListData(data?.data?.data);
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

  const handleOnDelete = async (item: any) => {
    try {
      dispatch(setIsLoading(true));

      const { data } = await apiHandler.crmHandler.attachmentDelete(
        item?._id,
        'doc_id=&action=CRM_ATTACHMENT',
      );
      showToast('success', data?.message);
      handleFetchData();
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const attachmentOpen = Boolean(attachmentAnchorEl);
  const attachmentId = attachmentOpen ? 'client-details-popover' : undefined;
  const clientOpen = Boolean(clientAnchorEl);
  const clientId = clientOpen ? 'client-details-popover' : undefined;

  return (
    <>
      {/* <FileModel
        isOpen={isOpen}
        viewData={viewData}
        closeModal={() => setIsOpen(false)}
        handleOnDelete={handleOnDelete}
      /> */}
      <PageBreadcrumb pageTitle="Timesheet Management" />
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <CrmSearchBox
            payload={payload}
            setPayload={setPayload}
            onClick={() => navigate('/crm/clients/create')}
            currentRole={userData?.user_type}
            isLoading={isLoading}
            permission={[ROLE.ADMIN, ROLE.BDE]}
            showActionButtons={false}
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

          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1102px] divide-y">
              {isLoading ? (
                <TableSkeleton rows={10} columns={TableCellData.length} />
              ) : (
                <Table>
                  {/* Table Header */}
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      {TableCellData.map((item: any, index: number) => (
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
                              <ChevronsUpDown className="size-3.5 min-h-3.5 min-w-3.5" />
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  {/* Table Body */}
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {attachmentListData?.map((item: any) => (
                      <TableRow key={item?._id}>
                        {TableCellData.map((col: any, idx: number) => {
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
                              return [country, city].filter(Boolean).join(', ');
                            }
                            return getValue(item, sortField);
                          };

                          const cellValue = getCellValue(item, col.sort_field!);

                          return (
                            <TableCell
                              key={idx}
                              className="px-4 whitespace-nowrap py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                            >
                              {col.value === 'Action' ? (
                                <div className="flex justify-start">
                                  <ActionButton
                                    handleOnDelete={() => handleOnDelete(item)}
                                    handleAttachment={() =>
                                      navigate(
                                        `/crm/pipeline/attachment?id=${item?.crm_main_id?._id}`,
                                      )
                                    }
                                    currentRole={userData?.user_type}
                                    permissions={crmPermissions}
                                  />
                                </div>
                              ) : col.value === 'Members' ? (
                                !isEmpty(cellValue) ? (
                                  <AssignToBadges
                                    names={cellValue}
                                    label="full_name"
                                    openLink
                                  />
                                ) : (
                                  <p>Not Assigned</p>
                                )
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
                              ) : col.value === 'Attachments' ? (
                                <p
                                  aria-describedby={attachmentId}
                                  className={`rounded-full w-fit text-gray-800 px-3 py-1 text-xs font-medium ${
                                    !isEmpty(cellValue)
                                      ? 'bg-gray-100 cursor-pointer'
                                      : ''
                                  }`}
                                  onMouseEnter={(e) => {
                                    if (!isEmpty(cellValue)) {
                                      setAttachmentAnchorEl(e.currentTarget);
                                      setPopoverItem(cellValue);
                                    }
                                  }}
                                >
                                  {!isEmpty(cellValue)
                                    ? cellValue.length
                                    : 'No'}{' '}
                                  Attachments
                                </p>
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
                                            setClientAnchorEl(e.currentTarget);
                                            setPopoverItem(client);
                                          }
                                        }}
                                      >
                                        {client?.name || '-'}
                                      </span>
                                    ),
                                  )}
                                </div>
                              ) : col.value === 'Notes' ? (
                                <p
                                  dangerouslySetInnerHTML={{
                                    __html: cellValue,
                                  }}
                                  className="truncate max-w-40"
                                />
                              ) : col?.renderCustomCell ? (
                                col?.renderCustomCell(col, cellValue)
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
              )}
              {attachmentListData?.length === 0 && <NoData />}
            </div>
          </div>

          <Pagination
            entriesPerPage={payload?.limit}
            totalEntries={pageData?.totalRecords}
            totalPages={pageData?.totalPages}
            setPayload={setPayload}
            page={payload?.page}
          />

          {attachmentOpen && (
            <Popover
              id={attachmentId || ''}
              open={attachmentOpen}
              anchorEl={attachmentAnchorEl}
              onClose={() => setAttachmentAnchorEl(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              slotProps={{
                paper: {
                  onMouseEnter: () => {
                    setIsHoveringPopover(true);
                  },
                  onMouseLeave: () => {
                    setIsHoveringPopover(false);
                    setAttachmentAnchorEl(null);
                    setPopoverItem(null);
                  },
                  sx: { p: 2, minWidth: 250, maxWidth: 400 },
                },
              }}
            >
              <div className="flex flex-col gap-2">
                {!isEmpty(popoverItem) ? (
                  popoverItem?.map((i: any) => (
                    <Link
                      key={i?._id}
                      to={i?.doc_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gray-600 text-xs hover:underline"
                    >
                      {i?.doc_name}
                    </Link>
                  ))
                ) : (
                  <p>No Attachments</p>
                )}
              </div>
            </Popover>
          )}

          {clientOpen && (
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
          )}
        </div>
      </div>
    </>
  );
};

export default CrmAttachmentsLists;
