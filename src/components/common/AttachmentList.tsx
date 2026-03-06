import { Popover } from '@mui/material';
import moment from 'moment';
import { useState } from 'react';
import { Link } from 'react-router';
import { apiHandler } from '../../api/apiHandler';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setIsLoading } from '../../redux/slices/loadingSlice';
import { getValue, isEmpty, showToast } from '../../utils/helper';
import { crmPermissions } from '../../utils/permissions';
import TextArea from '../form/input/TextArea';
import Label from '../form/Label';
import AssignToBadges from '../ui/badge/AssignToBadges';
import DetailsPopover from '../ui/DetailsPopover';
import { Modal } from '../ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../ui/table';
import ActionButton from './ActionButton';
import NoData from './NoData';

const FileModel = ({ isOpen, closeModal, viewData, handleOnDelete }: any) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="max-w-[700px] max-h-[400px] m-4 overflow-hidden"
    >
      <div className="flex flex-col gap-3 py-6">
        <div className="px-4">
          <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Note
          </Label>
          <div className="relative">
            <TextArea
              className="w-full rounded-lg border appearance-none !p-2 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
              value={viewData?.notes}
            />
          </div>
        </div>
        <div className="max-w-full overflow-auto">
          <div className="max-h-[550px] divide-y">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow className="py-2 bg-slate-100 rounded-t-md">
                  <TableCell className="text-center">Doc Name</TableCell>
                  <TableCell className="text-center">Action</TableCell>
                </TableRow>
              </TableHeader>
              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {!isEmpty(viewData?.attachment) ? (
                  viewData?.attachment?.map((value: any) => (
                    <TableRow className="py-2">
                      <TableCell className="text-gray-500 whitespace-nowrap text-theme-sm dark:text-gray-400 pl-4">
                        {value?.doc_name}
                      </TableCell>
                      <TableCell className="text-gray-500 text-center text-theme-sm dark:text-gray-400">
                        <div className="flex gap-2 justify-center">
                          <button
                            className="px-2 py-0.5 text-xs border rounded-md text-blue-500 border-blue-500"
                            onClick={() => window.open(value?.doc_link)}
                          >
                            View
                          </button>
                          <button
                            className="px-2 py-0.5 text-xs border rounded-md text-red-500 border-red-500"
                            onClick={() => handleOnDelete(value)}
                          >
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <NoData />
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const AttachmentList = ({
  tableCellData = [],
  listData,
  handleFetchData,
  handleAttachment,
}: any) => {
  const dispatch = useAppDispatch();
  const userData: any = useAppSelector((state) => state.user);

  const [attachmentAnchorEl, setAttachmentAnchorEl] =
    useState<HTMLElement | null>(null);
  const [clientAnchorEl, setClientAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const [popoverItem, setPopoverItem] = useState<any>(null);
  const [, setIsHoveringPopover] = useState(false);
  const [isOpen, setIsOpen] = useState<any>(false);
  const [viewData, setViewData] = useState(null);

  const handleOnView = async (item: any) => {
    setIsOpen(true);
    try {
      const { data } = await apiHandler.crmHandler.attachmentView(item?._id);
      setViewData(data?.data);
    } catch (error: any) {
      showToast('error', error?.message);
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
      <FileModel
        isOpen={isOpen}
        viewData={viewData}
        closeModal={() => setIsOpen(false)}
        handleOnDelete={handleOnDelete}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px] divide-y">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {tableCellData.map((item: any, index: number) => (
                    <TableCell
                      key={index}
                      isHeader
                      className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-gray-400"
                    >
                      <div className="flex gap-1 items-center">
                        {item?.value}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {listData?.map((item: any) => (
                  <TableRow key={item?._id}>
                    {tableCellData.map((col: any, idx: number) => {
                      const getCellValue = (item: any, sortField: string) => {
                        if (!sortField) return '';
                        const multipleValues = sortField.split(',');
                        if (multipleValues.length > 1) {
                          const [country, city] = multipleValues.map((field) =>
                            getValue(item, field),
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
                                handleOnView={() => handleOnView(item)}
                                handleOnDelete={() => handleOnDelete(item)}
                                handleAttachment={
                                  handleAttachment
                                    ? () => handleAttachment(item)
                                    : undefined
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
                              {!isEmpty(cellValue) ? cellValue.length : 'No'}{' '}
                              Attachments
                            </p>
                          ) : col.value === 'Clients Name' &&
                            !isEmpty(cellValue) ? (
                            <div className="flex flex-wrap gap-1">
                              {cellValue?.map((client: any, index: number) => (
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
                              ))}
                            </div>
                          ) : col.value === 'Notes' ? (
                            <p
                              dangerouslySetInnerHTML={{ __html: cellValue }}
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
            {listData?.length === 0 && <NoData />}
          </div>
        </div>

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
    </>
  );
};

export default AttachmentList;
