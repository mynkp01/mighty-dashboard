import {
  ArrowLeft,
  BadgeInfo,
  BookPlus,
  Handshake,
  MapPin,
  Plus,
  ShieldPlus,
  SmilePlus,
  Trash2,
} from 'lucide-react';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { useNavigate, useSearchParams } from 'react-router';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { showToast } from '../../../utils/helper';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import FileInput from '../../form/input/FileInput';
import Input from '../../form/input/InputField';
import TextArea from '../../form/input/TextArea';
import Label from '../../form/Label';
import Select from '../../form/Select';
import AnimatedButton from '../../ui/AnimatedButton';

const RecruitmentHubAction = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const action = searchParams.get('action');
  const id: any = searchParams.get('id');

  const fileInputRef = useRef<{ clearFiles: () => void }>(null);

  const [errors, setErrors] = useState<any>({});
  const [fileData, setFileData] = useState<any>(null);
  const [viewData, setViewData] = useState<any>(null);
  const [formData, setFormData] = useState({
    date: '',
    designation: '',
    vertical: '',
    vendors: '',
    candidate_name: '',
    contact_number: '',
    email: '',
    current_location: '',
    preferred_location: '',
    total_experience: '',
    relevant_experience: '',
    organization: '',
    ctc: '',
    expected_ctc: '',
    notice_period: '',
    reason_change: '',
    interview_level: [{ date: '', note: '', status: '', date_joining: '' }],
    remarks: '',
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === 'object' ? value?._id : value,
    }));
  };

  const addClients = () => {
    setFormData((prev) => ({
      ...prev,
      interview_level: [
        ...prev.interview_level,
        {
          date: '',
          note: '',
          status: '',
          date_joining: '',
        },
      ],
    }));
  };

  // Remove Clients
  const removeClients = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      interview_level: prev.interview_level.filter((_, i) => i !== index),
    }));
  };

  const handleViewData = async () => {
    try {
      dispatch(setIsLoading(true));
      const { data } = await apiHandler.RecruitmentHubHandler.get(id);
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
        interview_level:
          viewData?.interview_level?.length > 0
            ? viewData.interview_level.map((item: any) => ({ ...item }))
            : [{ date: '', note: '', status: '', date_joining: '' }],
      }));
    }
  }, [id, viewData]);

  const validateForm = () => {
    const newErrors: any = {};

    // Basic field validations
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.candidate_name.trim())
      newErrors.candidate_name = 'Candidate Name is required';
    if (!formData.designation.trim())
      newErrors.designation = 'Designation is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.contact_number)
      newErrors.contact_number = 'Contact Number is required';
    if (!formData.current_location)
      newErrors.current_location = 'Current Location is required';
    if (!formData.preferred_location)
      newErrors.preferred_location = 'Preferred Location is required';
    if (!formData.organization.trim())
      newErrors.organization = 'Organization is required';
    if (!formData.total_experience)
      newErrors.total_experience = 'Total Experience is required';
    if (!formData.relevant_experience)
      newErrors.relevant_experience = 'Relevant Experience is required';
    if (!formData.ctc) newErrors.ctc = 'Current CTC is required';
    if (!formData.expected_ctc)
      newErrors.expected_ctc = 'Expected CTC is required';
    if (!formData.notice_period)
      newErrors.notice_period = 'Notice Period is required';

    formData.interview_level.forEach((item, index) => {
      if (!item.date)
        newErrors[`interview_level${index}_date`] =
          'Interview Date is required';
      if (!item.status)
        newErrors[`interview_level${index}_status`] =
          'Interview Status is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: any) => {
    e.preventDefault();

    try {
      if (validateForm()) {
        dispatch(setIsLoading(true));
        const jsonFields = ['interview_level'];
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

        modifiedFormData.append('file', fileData);

        const { data } =
          action === 'edit'
            ? await apiHandler.RecruitmentHubHandler.update(
                id,
                modifiedFormData,
              )
            : await apiHandler.RecruitmentHubHandler.create(modifiedFormData);

        showToast('success', data?.message);
        navigate(-1);
      }
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Manage Recruitment Hub" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ">
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
            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/50">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-900">
                <BadgeInfo size="20" className="text-primary-500" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Date  */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Date
                  </Label>
                  <Flatpickr
                    disabled={action === 'view'}
                    placeholder="Select Date"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    options={{ dateFormat: 'd-m-Y' }}
                    value={formData.date ? new Date(formData.date) : ''}
                    onChange={([date]: any) =>
                      updateFormData('date', moment(date).format('YYYY-MM-DD'))
                    }
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-error-500">{errors.date}</p>
                  )}
                </div>

                {/* Candidate Name */}
                <div className="col-span-2 sm:col-span-1">
                  <Label
                    htmlFor="tl"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Candidate Name
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      placeholder="Enter Candidate Name"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      type="text"
                      value={formData.candidate_name}
                      onChange={(e) =>
                        updateFormData('candidate_name', e.target.value)
                      }
                    />
                  </div>
                  {errors.candidate_name && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.candidate_name}
                    </p>
                  )}
                </div>

                {/* Designation */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Designation
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      placeholder="Enter Designation"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      type="text"
                      value={formData.designation}
                      onChange={(e) =>
                        updateFormData('designation', e.target.value)
                      }
                    />
                  </div>
                  {errors.designation && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.designation}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/50">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-900">
                <MapPin size="20" className="text-primary-500" />
                Contact & Location Details
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Email  */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      placeholder="Enter Email"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Contact Number  */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Contact Number
                  </Label>
                  <TextArea
                    readOnly={action === 'view'}
                    placeholder="Enter Contact Number"
                    className="w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    value={formData.contact_number}
                    onChange={(e) =>
                      updateFormData('contact_number', e.target.value)
                    }
                  />
                  {errors.contact_number && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.contact_number}
                    </p>
                  )}
                </div>

                {/* Current Location  */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Current Location
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      placeholder="Enter Current Location"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      type="text"
                      value={formData.current_location}
                      onChange={(e) =>
                        updateFormData('current_location', e.target.value)
                      }
                    />
                  </div>
                  {errors.current_location && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.current_location}
                    </p>
                  )}
                </div>

                {/* Preferred Location  */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Preferred Location
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      placeholder="Enter Preferred Location"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      type="text"
                      value={formData.preferred_location}
                      onChange={(e) =>
                        updateFormData('preferred_location', e.target.value)
                      }
                    />
                  </div>
                  {errors.preferred_location && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.preferred_location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/50">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-900">
                <ShieldPlus size="20" className="text-primary-500" />
                Professional Details
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Total Experience */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Total Experience
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      placeholder="Enter Total Experience"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={formData.total_experience}
                      onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const input = e.target;
                        if (input.value.length > 10) {
                          input.value = input.value.slice(0, 10);
                        }
                      }}
                      onChange={(e) =>
                        updateFormData('total_experience', e.target.value)
                      }
                    />
                  </div>
                  {errors.total_experience && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.total_experience}
                    </p>
                  )}
                </div>

                {/* Relevant Experience */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Relevant Experience
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      placeholder="Enter Relevant Experience"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={formData.relevant_experience}
                      onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const input = e.target;
                        if (input.value.length > 10) {
                          input.value = input.value.slice(0, 10);
                        }
                      }}
                      onChange={(e) =>
                        updateFormData('relevant_experience', e.target.value)
                      }
                    />
                  </div>
                  {errors.relevant_experience && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.relevant_experience}
                    </p>
                  )}
                </div>

                {/* vertical */}
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

                {/* vendors */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Vendors
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      placeholder="Enter Vendors"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      type="text"
                      value={formData.vendors}
                      onChange={(e) =>
                        updateFormData('vendors', e.target.value)
                      }
                    />
                  </div>
                  {errors.vendors && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.vendors}
                    </p>
                  )}
                </div>

                {/* Organization  */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Organization
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      placeholder="Enter Organization"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      type="text"
                      value={formData.organization}
                      onChange={(e) =>
                        updateFormData('organization', e.target.value)
                      }
                    />
                  </div>
                  {errors.organization && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.organization}
                    </p>
                  )}
                </div>

                {/* Upload Resume */}
                <div className="col-span-2 sm:col-span-1">
                  <Label>Upload Resume</Label>
                  <FileInput
                    ref={fileInputRef}
                    onChange={(e) => setFileData(e.target.files?.[0])}
                    className="custom-class"
                  />
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/50">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-900">
                <Handshake size="20" className="text-primary-500" />
                Compensation & Terms
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Current CTC */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Current CTC
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      placeholder="Enter Current CTC"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={formData.ctc}
                      onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const input = e.target;
                        if (input.value.length > 10) {
                          input.value = input.value.slice(0, 10);
                        }
                      }}
                      onChange={(e) => updateFormData('ctc', e.target.value)}
                    />
                  </div>
                  {errors.ctc && (
                    <p className="mt-1 text-sm text-error-500">{errors.ctc}</p>
                  )}
                </div>

                {/* Expected CTC */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Expected CTC
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      placeholder="Enter Expected CTC"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={formData.expected_ctc}
                      onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const input = e.target;
                        if (input.value.length > 10) {
                          input.value = input.value.slice(0, 10);
                        }
                      }}
                      onChange={(e) =>
                        updateFormData('expected_ctc', e.target.value)
                      }
                    />
                  </div>
                  {errors.expected_ctc && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.expected_ctc}
                    </p>
                  )}
                </div>

                {/* Notice Period */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Notice Period
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      placeholder="Enter Notice Period"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={formData.notice_period}
                      onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const input = e.target;
                        if (input.value.length > 10) {
                          input.value = input.value.slice(0, 10);
                        }
                      }}
                      onChange={(e) =>
                        updateFormData('notice_period', e.target.value)
                      }
                    />
                  </div>
                  {errors.notice_period && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.notice_period}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/50">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-900">
                <BookPlus size="20" className="text-primary-500" />
                Additional Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Reason Change  */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Reason of Change
                  </Label>
                  <TextArea
                    rows={4}
                    readOnly={action === 'view'}
                    placeholder="Enter Reason Change"
                    className="w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    value={formData.reason_change}
                    onChange={(e) =>
                      updateFormData('reason_change', e.target.value)
                    }
                  />
                  {errors.reason_change && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.reason_change}
                    </p>
                  )}
                </div>

                {/* Remarks  */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Remarks
                  </Label>
                  <TextArea
                    rows={4}
                    readOnly={action === 'view'}
                    placeholder="Enter Remarks"
                    className="w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    value={formData.remarks}
                    onChange={(e) => updateFormData('remarks', e.target.value)}
                  />
                  {errors.remarks && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.remarks}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Interview Levels & Feedback */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <SmilePlus size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Interview Level Details
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Track multiple interview rounds and feedback
                      </p>
                    </div>
                  </div>

                  {action !== 'view' && (
                    <button
                      type="button"
                      onClick={addClients}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      <Plus size={16} />
                      Add Level
                    </button>
                  )}
                </div>
              </div>

              {/* Interview Levels */}
              <div className="p-6 space-y-6">
                {formData.interview_level?.map((item, index) => (
                  <div
                    key={index}
                    className="relative bg-slate-50/50 border border-slate-200 rounded-lg p-6 hover:shadow-sm transition-shadow duration-200"
                  >
                    {/* Delete Button for additional levels */}
                    {index > 0 && action !== 'view' && (
                      <div className="absolute top-4 right-4">
                        <button
                          type="button"
                          onClick={() => removeClients(index)}
                          className="flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                          title="Remove this level"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}

                    {/* Level Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                        {index + 1}
                      </div>
                      <h3 className="text-base font-medium text-gray-900">
                        Level #{index + 1}
                      </h3>
                    </div>

                    {/* Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="col-span-2 sm:col-span-1 space-y-3.5">
                        <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                          Interview Status
                        </Label>
                        <Select
                          isDisabled={action === 'view'}
                          endPoints={apiHandler.lookupValueHandler.lookupValue}
                          filterStr={`value_code=INTERVIEW_STATUS`}
                          placeholder="Select Status"
                          value={item?.status}
                          objKey="status"
                          display="name"
                          func={(objKey, defaultOption) =>
                            updateNestedFormData(
                              'interview_level',
                              index,
                              objKey,
                              defaultOption?._id,
                            )
                          }
                        />
                        {errors[`interview_level${index}_status`] && (
                          <p className="mt-1 text-sm text-error-500">
                            {errors[`interview_level${index}_status`]}
                          </p>
                        )}
                      </div>

                      {/* Date Field */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          Interview Date
                        </Label>
                        <Flatpickr
                          disabled={action === 'view'}
                          placeholder="Select Date"
                          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                          options={{ dateFormat: 'd-m-Y' }}
                          value={item.date ? new Date(item.date) : ''}
                          onChange={([date]: any) =>
                            updateNestedFormData(
                              'interview_level',
                              index,
                              'date',
                              moment(date).format('YYYY-MM-DD'),
                            )
                          }
                        />
                        {errors[`interview_level${index}_date`] && (
                          <p className="mt-1 text-sm text-error-500">
                            {errors[`interview_level${index}_date`]}
                          </p>
                        )}
                      </div>

                      {/* Feedback Field */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          Interview Feedback
                        </Label>
                        <TextArea
                          rows={4}
                          readOnly={action === 'view'}
                          placeholder="Enter interview feedback, observations, or remarks..."
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 resize-vertical transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            action === 'view'
                              ? 'bg-gray-50 cursor-not-allowed'
                              : 'hover:border-gray-400'
                          }`}
                          value={item.note || ''}
                          onChange={(e) =>
                            updateNestedFormData(
                              'interview_level',
                              index,
                              'note',
                              e.target.value,
                            )
                          }
                        />
                        {errors.note && (
                          <p className="flex items-center gap-1 text-sm text-red-600">
                            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                            {errors.note}
                          </p>
                        )}
                      </div>

                      {/* Date of Joining */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          Date of Joining
                        </Label>
                        <Flatpickr
                          disabled={action === 'view'}
                          placeholder="Select Date of Joining"
                          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                          options={{ dateFormat: 'd-m-Y' }}
                          value={
                            item.date_joining ? new Date(item.date_joining) : ''
                          }
                          onChange={([date]: any) =>
                            updateNestedFormData(
                              'interview_level',
                              index,
                              'date_joining',
                              moment(date).format('YYYY-MM-DD'),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            {action !== 'view' && (
              <div className="flex justify-end">
                <AnimatedButton variant="primary" size="md">
                  Save
                </AnimatedButton>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentHubAction;
