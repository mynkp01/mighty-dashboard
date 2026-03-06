import { SxProps } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { useNavigate, useSearchParams } from 'react-router';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { isEmpty, showToast } from '../../../utils/helper';
import AttachmentList from '../../common/AttachmentList';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import FileInput from '../../form/input/FileInput';
import TextArea from '../../form/input/TextArea';
import Label from '../../form/Label';
import Select from '../../form/Select';
import AnimatedButton from '../../ui/AnimatedButton';

const CrmAttachment = () => {
  const TableCellData = [
    {
      value: 'Next Approach Date',
      sort_field: 'next_approach_date',
      isDate: true,
    },
    { value: 'Date', sort_field: 'date', isDate: true },
    { value: 'CRM Type', sort_field: 'crm_type.name' },
    { value: 'CRM Sub Type', sort_field: 'crm_sub_type.name' },
    { value: 'Members', sort_field: 'members' },
    { value: 'Attachments', sort_field: 'attachment' },
    { value: 'Attachment Type', sort_field: 'attachment_type.name' },
    { value: 'Notes', sort_field: 'notes' },
    { value: 'Action' },
  ];

  const initialData = {
    crm_type: '',
    crm_sub_type: '',
    attachment_type: '',
    date: '',
    notes: '',
    next_approach_date: '',
    members: [],
  };

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const dispatch = useAppDispatch();

  const id: any = searchParams.get('id');
  const fileInputRef = useRef<{ clearFiles: () => void }>(null);

  const [errors, setErrors] = useState<any>({});
  const [listData, setListData] = useState<any>([]);
  const [files, setFiles] = useState<any>(null);
  const [formData, setFormData] = useState(initialData);
  const [crmSubTypes, setCrmSubTypes] = useState([]);

  const fetchCrmSubTypes = async () => {
    try {
      const { data } = await apiHandler.lookupValueHandler.lookupValue(
        `parent_category_id=${formData?.crm_type || ''}`,
      );
      setCrmSubTypes(data?.data || []);
    } catch (error: any) {
      showToast('error', error?.message);
    }
  };

  useEffect(() => {
    if (!isEmpty(formData?.crm_type)) {
      fetchCrmSubTypes();
    } else {
      setCrmSubTypes([]);
    }
  }, [formData?.crm_type]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Array.isArray(value)
        ? value.map((v) => v?._id)
        : typeof value === 'object' && value !== null
          ? value instanceof Date
            ? value.toUTCString()
            : value?._id
          : value,
    }));

    if (field === 'crm_type') {
      setFormData((prev) => ({ ...prev, crm_sub_type: '' }));
      setErrors((prevErrors: any) => ({
        ...prevErrors,
        crm_sub_type: '',
      }));
    }

    if (errors[field]) {
      setErrors((prevErrors: any) => ({
        ...prevErrors,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const requiredFields: Record<string, string> = {
      crm_type: 'CRM Type is required',
      attachment_type: 'Attachment Type is required',
      members: 'Members is required',
      date: 'Date is required',
      next_approach_date: 'Next Approach Date is required',
    };

    if (!isEmpty(crmSubTypes)) {
      requiredFields.crm_sub_type = 'CRM Sub Type is required';
    }

    Object.entries(requiredFields).forEach(([field, message]) => {
      const value = (formData as any)[field];
      if (typeof value === 'string' && !value) {
        newErrors[field] = message;
      }

      if (Array.isArray(value) && value.length === 0) {
        newErrors[field] = message;
      }
    });

    if ((files && files.length === 0) || !formData.notes) {
      newErrors['notes'] = 'Either Notes or an Attachment is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: any) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        dispatch(setIsLoading(true));
        if (!formData.notes && (!files || files.length === 0)) {
          return showToast(
            'error',
            'Add either Notes or an Attachment before continuing.',
          );
        }

        const convertFormData = new FormData();

        console.log('formData?.members', formData?.members);
        console.log(
          'JSON.stringify(formData?.members)',
          JSON.stringify(formData?.members),
        );

        convertFormData.append('crm_main_id', id);
        convertFormData.append('crm_type', formData?.crm_type);
        convertFormData.append('crm_sub_type', formData?.crm_sub_type);
        convertFormData.append('attachment_type', formData?.attachment_type);
        convertFormData.append('members', JSON.stringify(formData?.members));
        convertFormData.append('date', formData?.date);
        convertFormData.append(
          'next_approach_date',
          formData?.next_approach_date,
        );
        if (!isEmpty(files)) {
          files?.forEach((file: any) => {
            convertFormData.append('files', file);
          });
        }
        convertFormData.append('notes', formData?.notes);
        // Append each file

        const { data } =
          await apiHandler.crmHandler.attachment(convertFormData);
        showToast('success', data?.message);
        handleFetchData();
        setFormData(initialData);
        setFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.clearFiles();
        }
      } catch (error: any) {
        showToast('error', error?.message);
      } finally {
        dispatch(setIsLoading(false));
      }
    }
  };

  const handleFetchData = async () => {
    try {
      dispatch(setIsLoading(true));
      const { data } = await apiHandler.crmHandler.attachmentList({
        crm_id: id,
      });
      const mainData = data?.data?.data || [];
      setListData(mainData);
      setFormData({
        ...initialData,
        crm_type: mainData[mainData.length - 1]?.crm_type?._id || '',
        crm_sub_type: mainData[mainData.length - 1]?.crm_sub_type?._id || '',
        members:
          mainData[mainData.length - 1]?.members?.map(
            (member: any) => member?._id,
          ) || [],
      });
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    if (id) {
      handleFetchData();
    }
  }, [id]);

  return (
    <div>
      <PageBreadcrumb pageTitle={'Manage Attachment'} />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] mb-4">
        <div className="px-6 py-3 flex justify-end">
          <AnimatedButton
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-4 mr-2" /> Back
          </AnimatedButton>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {/* CRM Type  */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Select CRM Type
                </Label>
                <Select
                  endPoints={apiHandler.lookupValueHandler.lookupValue}
                  filterStr={`value_code=CRM_TYPE`}
                  placeholder="Select CRM Type"
                  value={formData.crm_type}
                  isDisabled={
                    !isEmpty(listData[listData.length - 1]?.crm_type?._id)
                  }
                  objKey="crm_type"
                  display="name"
                  func={updateFormData}
                />
                {errors.crm_type && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.crm_type}
                  </p>
                )}
              </div>
              {/* CRM Sub Type  */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Select CRM Sub Type
                </Label>
                <Select
                  data={crmSubTypes}
                  placeholder="Select CRM Sub Type"
                  value={formData.crm_sub_type}
                  objKey="crm_sub_type"
                  isDisabled={
                    !isEmpty(
                      listData[listData.length - 1]?.crm_sub_type?._id,
                    ) || isEmpty(formData?.crm_type)
                  }
                  display="name"
                  func={updateFormData}
                />
                {errors.crm_sub_type && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.crm_sub_type}
                  </p>
                )}
              </div>
              {/* Attachment Type  */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Attachment Type
                </Label>
                <Select
                  endPoints={apiHandler.lookupValueHandler.lookupValue}
                  filterStr={`value_code=CRM_ATTACHMENT_TYPE`}
                  placeholder="Select Attachment Type"
                  value={formData.attachment_type}
                  objKey="attachment_type"
                  func={updateFormData}
                  display="name"
                />
                {errors.attachment_type && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.attachment_type}
                  </p>
                )}
              </div>
              {/* Employee List  */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Select Members
                </Label>
                <Select
                  multiple
                  endPoints={apiHandler.userHandler.lookup}
                  filterStr={`value=`}
                  placeholder="Select Members"
                  value={formData.members}
                  objKey="members"
                  func={updateFormData}
                  textMenuSx={(prevSx) => ({ ...prevSx, ...SelectSx })}
                  display="full_name"
                />
                {errors.members && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.members}
                  </p>
                )}
              </div>
              {/* Date */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Date
                </Label>
                <Flatpickr
                  placeholder="Select Date"
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                  options={{ dateFormat: 'd/m/y' }}
                  value={formData.date ? new Date(formData?.date) : ''}
                  onChange={([date]) => updateFormData('date', new Date(date))}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-error-500">{errors.date}</p>
                )}
              </div>
              {/* Next Approach Date */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Next Approach Date
                </Label>
                <Flatpickr
                  placeholder="Select Date"
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                  options={{
                    dateFormat: 'd/m/y',
                    minDate:
                      formData.date ||
                      new Date(new Date().setHours(0, 0, 0, 0)),
                  }}
                  value={
                    formData.next_approach_date
                      ? new Date(formData?.next_approach_date)
                      : ''
                  }
                  onChange={([date]) =>
                    updateFormData('next_approach_date', new Date(date))
                  }
                />
                {errors.next_approach_date && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.next_approach_date}
                  </p>
                )}
              </div>
              {/* File Upload */}
              <div className="col-span-2 sm:col-span-1">
                <Label>Upload file</Label>
                <FileInput
                  ref={fileInputRef}
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="custom-class"
                />
              </div>
              {/* Note  */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Note
                </Label>
                <TextArea
                  placeholder="Enter Note"
                  className="w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-error-500">{errors.notes}</p>
                )}
              </div>
            </div>
            <div className="flex h-full justify-end items-end col-span-2">
              <AnimatedButton variant="primary" size="md" type="submit">
                Save
              </AnimatedButton>
            </div>
          </form>
        </div>
      </div>

      {/* AttachmentList */}
      <AttachmentList
        tableCellData={TableCellData}
        listData={listData}
        handleFetchData={handleFetchData}
      />
    </div>
  );
};

const SelectSx: SxProps = {
  '& .MuiChip-root': {
    px: '6px !important',
    py: '2px !important',
    height: 'auto !important',
    margin: '0px !important',
    gap: '3px !important',
    maxWidth: '100% !important',
  },
  '& .MuiChip-label': {
    px: '0px !important',
  },
  '& .MuiChip-deleteIcon': {
    height: '16px !important',
    width: '16px !important',
    margin: '0px !important',
  },
};

export default CrmAttachment;
