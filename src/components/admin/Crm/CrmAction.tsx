import {
  ArrowLeft,
  BadgeDollarSign,
  ChartBar,
  Download,
  Eye,
  FilePlus,
  FileText,
  HandHelping,
  MapPin,
  SmilePlus,
  Trash2,
} from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { useNavigate, useSearchParams } from 'react-router';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { emailRegex, isEmpty, showToast } from '../../../utils/helper';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import Label from '../../form/Label';
import Select from '../../form/Select';
import FileInput from '../../form/input/FileInput';
import Input from '../../form/input/InputField';
import TextArea from '../../form/input/TextArea';
import AnimatedButton from '../../ui/AnimatedButton';
import AnimatedCard from '../../ui/AnimatedCard';
import LoadingSkeleton from '../../ui/LoadingSkeleton';
import Button from '../../ui/button/Button';

const CrmAction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const action = searchParams.get('action');
  const id: any = searchParams.get('id');

  const dispatch = useAppDispatch();

  const [errors, setErrors] = useState<any>({});
  const [fileData, setFileData] = useState<any>([]);
  const [viewData, setViewData] = useState<any>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    origin_of_clients: '',
    reference: '',
    email: '',
    phone_number: '',
    website: '',
    remarks: '',
    country: null,
    city: null,
    working_date: '',
    platform: null,
    vertical: null,
    bank_details: '',
    sla_doc: [],
    nda_doc: [],
    clients_name: [
      {
        name: '',
        phone_number: '',
        email: '',
        address: '',
        date_of_birth: '',
        designation: '',
        linkedin: '',
      },
    ],
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === 'object' ? value?._id : value,
      ...(field === 'country' ? { city: null } : {}),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const requiredFields: Record<string, string> = {
      company_name: 'Company Name is required',
      website: 'Invalid website format',
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      const value = (formData as any)[field];
      if (!value) {
        newErrors[field] = message;
      }
      if (!isEmpty(value) && field === 'website') {
        const websiteRegex =
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (value && !websiteRegex.test(value)) {
          newErrors[field] = message;
        }
      }
    });

    if (formData.email) {
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    // Clients Name validation
    if (!formData.clients_name?.length) {
      newErrors.clients_name = 'At least one client is required';
    } else {
      formData.clients_name.forEach((client, idx) => {
        const clientFields: Record<string, string> = {
          name: 'Client name is required',
        };
        if (client.email) {
          clientFields.email = 'Client email is required';
        }

        Object.entries(clientFields).forEach(([field, message]) => {
          const value = client[field as keyof typeof client]?.toString().trim();

          if (!value && field !== 'email') {
            newErrors[`clients_name_${idx}_${field}`] = message;
          }

          if (field === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              newErrors[`clients_name_${idx}_${field}`] =
                'Invalid email format';
            }
          }
        });
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add Clients
  const addClients = () => {
    setFormData((prev) => ({
      ...prev,
      clients_name: [
        ...prev.clients_name,
        {
          name: '',
          phone_number: '',
          email: '',
          address: '',
          date_of_birth: '',
          designation: '',
          linkedin: '',
        },
      ],
    }));
  };

  // Remove Clients
  const removeClients = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      clients_name: prev.clients_name.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e: any) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        dispatch(setIsLoading(true));
        const jsonFields = ['clients_name', 'sla_doc', 'nda_doc'];
        const modifiedFormData = new FormData();

        Object.keys(formData).forEach((key) => {
          if (!jsonFields.includes(key)) {
            modifiedFormData.append(key, (formData as any)[key] ?? '');
          }
        });

        jsonFields.forEach((field) => {
          if ((formData as any)?.[field]) {
            modifiedFormData.append(
              field,
              JSON.stringify((formData as any)[field] || []),
            );
          }
        });

        fileData?.forEach((item: any) => {
          Object.keys(item).forEach((key) => {
            if (key.endsWith('Files') && Array.isArray(item[key])) {
              item[key].forEach((file: File) => {
                modifiedFormData.append(key, file);
              });
            }
          });
        });

        const { data } =
          action === 'edit'
            ? await apiHandler.crmHandler.update(id, modifiedFormData)
            : await apiHandler.crmHandler.create(modifiedFormData);

        showToast('success', data?.message);
        navigate(-1);
      } catch (error: any) {
        showToast('error', error?.message);
      } finally {
        dispatch(setIsLoading(false));
      }
    }
  };

  const handleViewData = async () => {
    try {
      dispatch(setIsLoading(true));
      const { data } = await apiHandler.crmHandler.get(id);
      setViewData(data?.data);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const updateNestedFormData = (
    field: string,
    index: number,
    key: string,
    value: any,
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  useEffect(() => {
    if (id) {
      handleViewData();
    }
  }, [id]);

  useEffect(() => {
    if (id && viewData) {
      const keysToRemove = [
        'assigned_to',
        'month',
        '_id',
        'createdAt',
        'updatedAt',
        'is_deleted',
        '__v',
      ];

      const filteredObj = Object.fromEntries(
        Object.entries(viewData).filter(([key]) => !keysToRemove.includes(key)),
      );

      setFormData((prev) => ({
        ...prev,
        ...filteredObj,
        clients_name:
          viewData?.clients_name?.length > 0
            ? viewData.clients_name.map((item: any) => ({
                ...item,
                date_of_birth: item?.date_of_birth ? item.date_of_birth : '',
              }))
            : [
                {
                  name: '',
                  phone_number: '',
                  email: '',
                  address: '',
                  date_of_birth: '',
                  designation: '',
                  linkedin: '',
                },
              ],
      }));
    }
  }, [id, viewData]);

  const updateFilesData = (name: string, files: FileList | null) => {
    setFileData((prev: any) => {
      const existingIndex = prev.findIndex((item: any) => item?.name === name);

      if (existingIndex !== -1) {
        return prev.map((item: any, index: number) =>
          index === existingIndex
            ? { ...item, [name + 'Files']: Array.from(files || []) }
            : item,
        );
      } else {
        return [...prev, { name, [name + 'Files']: Array.from(files || []) }];
      }
    });
  };

  const handleDeleteDocument = async (docId: any) => {
    try {
      dispatch(setIsLoading(true));
      const { data } = await apiHandler.crmHandler.attachmentDelete(
        id,
        `doc_id=${docId}&action=BANK_ATTACHMENT`,
      );
      showToast('success', data?.message);
      handleViewData();
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleDownloadDocument = async (item: any) => {
    try {
      dispatch(setIsLoading(true));
      const response = await fetch(item.doc_link);
      const imageBlob = await response.blob();
      const filename = `${item?.doc_name}`;
      const blobType = imageBlob.type;

      const blob = new Blob([imageBlob], { type: blobType });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
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

  if (id && isEmpty(viewData)) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="CRM Management" />
        <AnimatedCard>
          <LoadingSkeleton variant="text" lines={20} />
        </AnimatedCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="CRM Management" />
      <AnimatedCard className="p-0">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {action === 'view'
                ? 'View'
                : action === 'edit'
                ? 'Edit'
                : 'Create'}{' '}
              CRM
            </h1>
            <AnimatedButton
              variant="secondary"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="size-4 mr-2" /> Back
            </AnimatedButton>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-6" noValidate>
            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/30">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-900">
                <ChartBar size="20" className="text-primary-500" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Company Name */}
                <div className="col-span-2 sm:col-span-1">
                  <Label
                    htmlFor="tl"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Company Name
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      placeholder="Enter Company Name"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      type="text"
                      value={formData.company_name}
                      onChange={(e) =>
                        updateFormData('company_name', e.target.value)
                      }
                    />
                  </div>
                  {errors.company_name && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.company_name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Email
                  </Label>
                  <Input
                    readOnly={action === 'view'}
                    placeholder="Enter Email"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number  */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Phone Number
                  </Label>
                  <TextArea
                    readOnly={action === 'view'}
                    placeholder="Enter Phone Number"
                    className="w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    value={formData.phone_number}
                    onChange={(e) =>
                      updateFormData('phone_number', e.target.value)
                    }
                  />
                </div>

                {/* Website */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Website
                  </Label>
                  <Input
                    readOnly={action === 'view'}
                    placeholder="Enter Website"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    type="text"
                    value={formData.website}
                    onChange={(e) => updateFormData('website', e.target.value)}
                  />
                  {errors.website && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.website}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/30">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-900">
                <MapPin size="20" className="text-primary-500" />
                Location & Business Details
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Country */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Country
                  </Label>
                  <Select
                    isDisabled={action === 'view'}
                    endPoints={apiHandler.countryHandler.lookup}
                    filterStr={`value_code=`}
                    placeholder="Select Country"
                    value={formData.country}
                    objKey="country"
                    display="name"
                    func={updateFormData}
                  />
                </div>

                {/* City */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    City
                  </Label>
                  <Select
                    isDisabled={action === 'view' || !formData.country}
                    endPoints={apiHandler.CityHandler.lookup}
                    filterStr={`country_id=${formData.country ?? ''}`}
                    placeholder="Select City"
                    value={formData.city}
                    objKey="city"
                    display="name"
                    func={updateFormData}
                  />
                </div>

                {/* Vertical */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Vertical
                  </Label>
                  <Select
                    isDisabled={action === 'view'}
                    endPoints={apiHandler.lookupValueHandler.lookupValue}
                    filterStr={`value_code=VERTICAL`}
                    placeholder="Select Vertical"
                    value={formData.vertical}
                    objKey="vertical"
                    display="name"
                    func={updateFormData}
                  />
                </div>

                {/* Platform */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Platform
                  </Label>
                  <Select
                    isDisabled={action === 'view'}
                    endPoints={apiHandler.lookupValueHandler.lookupValue}
                    filterStr={`value_code=PLATFORM`}
                    placeholder="Select Platform"
                    value={formData.platform}
                    objKey="platform"
                    display="name"
                    func={updateFormData}
                  />
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/30">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-900">
                <HandHelping size="20" className="text-primary-500" />
                Relationship & References
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Working Date */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Working Date
                  </Label>
                  <Flatpickr
                    disabled={action === 'view'}
                    placeholder="Enter Start Working Date"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    options={{ dateFormat: 'd-m-Y', maxDate: new Date() }}
                    value={
                      formData.working_date
                        ? new Date(formData.working_date)
                        : ''
                    }
                    onChange={([date]) =>
                      updateFormData(
                        'working_date',
                        moment(date).format('YYYY-MM-DD'),
                      )
                    }
                  />
                </div>

                {/* Reference */}
                <div className="col-span-2 sm:col-span-1">
                  <Label
                    htmlFor="tl"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Referred By
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      placeholder="Enter Reference"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      type="text"
                      value={formData.reference}
                      onChange={(e) =>
                        updateFormData('reference', e.target.value)
                      }
                    />
                  </div>
                  {errors.reference && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.reference}
                    </p>
                  )}
                </div>

                {/* origin_of_clients */}
                <div className="col-span-2 sm:col-span-1">
                  <Label
                    htmlFor="tl"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Origin of Clients
                  </Label>
                  <Input
                    readOnly={action === 'view'}
                    placeholder="Enter Origin of Clients"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    type="text"
                    value={formData.origin_of_clients}
                    onChange={(e) =>
                      updateFormData('origin_of_clients', e.target.value)
                    }
                  />
                  {errors.origin_of_clients && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.origin_of_clients}
                    </p>
                  )}
                </div>

                {/* Remarks  */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Remarks
                  </Label>
                  <TextArea
                    readOnly={action === 'view'}
                    placeholder="Enter Remarks"
                    className="w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    value={formData.remarks}
                    onChange={(e) => updateFormData('remarks', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Bank Details  */}
            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/30">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-900">
                <BadgeDollarSign size="20" className="text-primary-500" />
                Financial Information
              </h2>
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Banking Details
                </Label>
                <TextArea
                  readOnly={action === 'view'}
                  placeholder="Enter Bank Details"
                  className="w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                  value={formData.bank_details}
                  onChange={(e) =>
                    updateFormData('bank_details', e.target.value)
                  }
                />
              </div>
            </div>

            {/* Bank Document Management */}
            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/30">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-900">
                <FilePlus size="20" className="text-primary-500" />
                Document Management
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* SLA Document Section */}
                <div className="space-y-4">
                  <div>
                    <Label>SLA Document</Label>
                    <FileInput
                      onChange={(e) =>
                        updateFilesData('sla_doc', e.target.files)
                      }
                      multiple
                      className="custom-class"
                    />
                  </div>

                  {/* Display uploaded SLA documents */}
                  {viewData?.sla_doc && viewData?.sla_doc.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">
                        Uploaded Files:
                      </p>
                      {viewData?.sla_doc.map((doc: any, index: number) => (
                        <div
                          key={doc._id || index}
                          className="flex items-center justify-between bg-white border border-slate-200 rounded-md p-3"
                        >
                          <div className="flex items-center gap-2">
                            <FileText size="16" className="text-slate-500" />
                            <span
                              className="text-sm text-slate-900 truncate"
                              title={doc.doc_name}
                            >
                              {doc.doc_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                window.open(doc.doc_link, '_blank')
                              }
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="View document"
                            >
                              <Eye size="14" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadDocument(doc)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Download document"
                            >
                              <Download size="14" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(doc._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete document"
                            >
                              <Trash2 size="14" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* NDA Document Section */}
                <div className="space-y-4">
                  <div>
                    <Label>NDA Document</Label>
                    <FileInput
                      onChange={(e) =>
                        updateFilesData('nda_doc', e.target.files)
                      }
                      multiple
                      className="custom-class"
                    />
                  </div>

                  {/* Display uploaded NDA documents */}
                  {viewData?.nda_doc && viewData?.nda_doc.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">
                        Uploaded Files:
                      </p>
                      {viewData?.nda_doc.map((doc: any, index: number) => (
                        <div
                          key={doc._id || index}
                          className="flex items-center justify-between bg-white border border-slate-200 rounded-md p-3"
                        >
                          <div className="flex items-center gap-2">
                            <FileText size="16" className="text-slate-500" />
                            <span
                              className="text-sm text-slate-900 truncate"
                              title={doc.doc_name}
                            >
                              {doc.doc_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                window.open(doc.doc_link, '_blank')
                              }
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="View document"
                            >
                              <Eye size="14" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadDocument(doc)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Download document"
                            >
                              <Download size="14" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(doc._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete document"
                            >
                              <Trash2 size="14" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Document Summary */}
              {((viewData?.sla_doc && viewData?.sla_doc.length > 0) ||
                (viewData?.nda_doc && viewData?.nda_doc.length > 0)) && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>
                      Total Documents:{' '}
                      {(viewData?.sla_doc?.length || 0) +
                        (viewData?.nda_doc?.length || 0)}
                    </span>
                    <span>
                      SLA: {viewData?.sla_doc?.length || 0} | NDA:{' '}
                      {viewData?.nda_doc?.length || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Clients Names */}
            <div className="space-y-5">
              {formData.clients_name?.map((item, index) => (
                <div
                  key={index}
                  className="p-5 space-y-4 border border-slate-200 rounded-lg bg-slate-50/30"
                >
                  {index === 0 && (
                    <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-gray-200 pb-4">
                      <div className="flex gap-2 items-center">
                        <SmilePlus size="20" className="text-primary-500" />
                        <h2 className="text-base font-semibold">
                          Clients Details
                        </h2>
                      </div>
                      {action !== 'view' && (
                        <Button
                          type="button"
                          name="Add More"
                          size="xs"
                          onClick={addClients}
                        />
                      )}
                    </div>
                  )}

                  {index > 0 && action !== 'view' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeClients(index)}
                        className="text-red-500 cursor-pointer"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  )}

                  <h2 className="text-sm font-medium">Clients #{index + 1}</h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {/* name  */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Name
                      </Label>
                      <Input
                        readOnly={action === 'view'}
                        placeholder="Enter Client Name"
                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateNestedFormData(
                            'clients_name',
                            index,
                            'name',
                            e.target.value,
                          )
                        }
                      />
                      {errors[`clients_name_${index}_name`] && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors[`clients_name_${index}_name`]}
                        </p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label
                        htmlFor="joining_date"
                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        Date of Birth
                      </Label>
                      <Flatpickr
                        disabled={action === 'view'}
                        id="Date of Birth"
                        placeholder="Enter Date of Birth"
                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                        options={{ dateFormat: 'd/m/y', maxDate: new Date() }}
                        value={item.date_of_birth}
                        onChange={([date]) =>
                          updateNestedFormData(
                            'clients_name',
                            index,
                            'date_of_birth',
                            date,
                          )
                        }
                      />
                    </div>

                    {/* email  */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Email
                      </Label>
                      <Input
                        readOnly={action === 'view'}
                        placeholder="Enter Email"
                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                        type="email"
                        value={item.email}
                        onChange={(e) =>
                          updateNestedFormData(
                            'clients_name',
                            index,
                            'email',
                            e.target.value,
                          )
                        }
                      />
                      {errors[`clients_name_${index}_email`] && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors[`clients_name_${index}_email`]}
                        </p>
                      )}
                    </div>

                    {/* designation  */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Designation
                      </Label>
                      <Input
                        readOnly={action === 'view'}
                        placeholder="Enter Designation"
                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                        type="text"
                        value={item.designation}
                        onChange={(e) =>
                          updateNestedFormData(
                            'clients_name',
                            index,
                            'designation',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    {/* linkedin  */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Linkedin
                      </Label>
                      <Input
                        readOnly={action === 'view'}
                        placeholder="Enter Linkedin URL"
                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                        type="text"
                        value={item.linkedin}
                        onChange={(e) =>
                          updateNestedFormData(
                            'clients_name',
                            index,
                            'linkedin',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    {/* Phone Number  */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Phone Number
                      </Label>
                      <TextArea
                        readOnly={action === 'view'}
                        placeholder="Enter Phone Number"
                        className="w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                        value={item.phone_number}
                        onChange={(e) =>
                          updateNestedFormData(
                            'clients_name',
                            index,
                            'phone_number',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    {/* Address  */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Address
                      </Label>
                      <TextArea
                        readOnly={action === 'view'}
                        placeholder="Enter Address"
                        className="w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                        value={item.address}
                        onChange={(e) =>
                          updateNestedFormData(
                            'clients_name',
                            index,
                            'address',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {action !== 'view' && (
              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                <AnimatedButton type="submit" variant="primary" size="md">
                  {action === 'edit' ? 'Update CRM' : 'Create CRM'}
                </AnimatedButton>
              </div>
            )}
          </form>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default CrmAction;
