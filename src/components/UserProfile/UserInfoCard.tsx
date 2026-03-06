import { yupResolver } from '@hookform/resolvers/yup';
import { Pencil } from 'lucide-react';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { apiHandler } from '../../api/apiHandler';
import { useModal } from '../../hooks/useModal';
import { useAppDispatch } from '../../redux/hooks';
import { setIsLoading } from '../../redux/slices/loadingSlice';
import { ROLE } from '../../utils/Constant';
import { emailRegex, isEmpty, showToast } from '../../utils/helper';
import Input from '../form/input/InputField';
import TextArea from '../form/input/TextArea';
import Label from '../form/Label';
import Select from '../form/Select';
import AnimatedButton from '../ui/AnimatedButton';
import { Modal } from '../ui/modal';

export default function UserInfoCard({ userData, handleFetchUser }: any) {
  const { isOpen, openModal, closeModal } = useModal();
  const dispatch = useAppDispatch();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<any>({
    preview: '',
    file: '',
  });

  const validationSchema = yup.object().shape({
    full_name: yup.string().trim().required('Full Name is required'),
    phone_number: yup.string().trim().required('Phone Number is required'),
    company_email: yup
      .string()
      .trim()
      .matches(emailRegex, 'Invalid Email')
      .required('Company Email is required'),
    personal_email: yup
      .string()
      .trim()
      .matches(emailRegex, 'Invalid Email')
      .required('Personal Email is required'),
    skills: yup.array().of(yup.string()).optional(),
    date_of_birth: yup.string().trim().required('Date of birth is required'),
    emergency: yup.object({
      name: yup.string().trim(),
      relation: yup.string().trim(),
      phoneNumber: yup.string().trim(),
    }),
    address: yup.string(),
    city: yup.string().required('City is required'),
    country: yup.string().required('Country is required'),
    designation: yup.string(),
    department: yup.array(),
    joining_date: yup.string(),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      full_name: '',
      phone_number: '',
      company_email: '',
      personal_email: '',
      date_of_birth: '',
      skills: [],
      city: '',
      country: '',
      emergency: {
        name: '',
        relation: '',
        phoneNumber: '',
      },
      address: '',
      designation: '',
      department: [],
      joining_date: '',
    },
  });

  const selectedCountry = watch('country');

  const handleSave = async (payload: any) => {
    const formData = new FormData();

    formData.append('full_name', payload?.full_name);
    formData.append('phone_number', payload?.phone_number);
    formData.append('company_email', payload?.company_email);
    formData.append('personal_email', payload?.personal_email);
    formData.append('skills', JSON.stringify(payload?.skills || []));
    formData.append('file', imagePreview.file);
    formData.append('date_of_birth', payload?.date_of_birth);
    formData.append('emergency.name', payload?.emergency?.name);
    formData.append('emergency.phoneNumber', payload?.emergency?.phoneNumber);
    formData.append('emergency.relation', payload?.emergency?.relation);
    formData.append('address', payload?.address ?? '');
    formData.append('country', payload?.country ?? '');
    formData.append('city', payload?.city ?? '');

    try {
      dispatch(setIsLoading(true));
      const { data } = await apiHandler.authHandler.updateProfile(formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showToast('success', data?.message);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
      handleFetchUser();
      closeModal();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview({ preview: imageUrl, file: file });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setImagePreview({
        preview:
          userData?.profile_picture?.doc_path || '/images/logo/banner.png',
        file: null,
      });
    }
  }, [isOpen, userData]);

  useEffect(() => {
    if (isOpen) {
      reset({
        full_name: userData?.full_name,
        personal_email: userData?.personal_email,
        company_email: userData?.company_email,
        phone_number: userData?.phone_number,
        skills: userData?.skills || [],
        date_of_birth: userData.date_of_birth
          ? new Date(userData.date_of_birth).toISOString().split('T')[0]
          : '',
        emergency: !isEmpty(userData?.emergency)
          ? userData?.emergency
          : {
              name: '',
              relation: '',
              phoneNumber: '',
            },
        address: userData?.address,
        designation: userData?.designation?._id,
        department: userData?.department?.map((item: any) => item?._id),
        city: userData?.city?._id,
        country: userData?.country?._id,
        joining_date: userData?.joining_date,
      });
    }
  }, [isOpen, reset]);

  const handleSetValue = useCallback(
    (key: any, value: any) => {
      let newValue;

      if (Array.isArray(value)) {
        newValue = value.map((v) => v?._id);
      } else if (typeof value === 'object') {
        newValue = value?._id || '';
      } else {
        newValue = value;
      }

      setValue(key, newValue);
      if (key === 'country') {
        setValue('city', '');
      }
    },
    [setValue],
  );

  return (
    <>
      {/* Personal Information */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>
          <button
            onClick={openModal}
            className="flex w-full sm:w-fit items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 xl:grid-cols-4 lg:gap-7 2xl:gap-x-32">
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Full Name
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {userData?.full_name}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Personal Email
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {userData?.personal_email}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Phone Number
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {userData?.phone_number}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Company Email
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {userData?.company_email}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Date of Birth
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {moment(userData?.date_of_birth).format('DD-MM-YYYY')}
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Address
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90 text-wrap break-all">
              {userData?.address ?? 'N/A'}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Country
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {userData?.country?.name ?? 'N/A'}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              City
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {userData?.city?.name ?? 'N/A'}
            </p>
          </div>
        </div>

        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[1000px] m-4"
        >
          <div className="no-scrollbar relative w-full rounded-2xl bg-white p-4 dark:bg-gray-900 lg:p-6">
            <div className="px-2">
              <h4 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Edit Profile
              </h4>
            </div>
            <form className="flex flex-col" onSubmit={handleSubmit(handleSave)}>
              <div className="custom-scrollbar max-h-[450px] overflow-y-auto px-2 pb-3">
                <div className="flex flex-col gap-8">
                  <div className="flex justify-center gap-2">
                    <div className="relative w-24 h-24">
                      <img
                        src={imagePreview?.preview}
                        alt="Profile"
                        className="object-cover w-full h-full rounded-full"
                        onError={(e: any) => {
                          e.target.src = '/images/logo/banner.png';
                        }}
                      />

                      <button
                        type="button"
                        className="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Pencil className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                  {/* Personal Details Section */}
                  <h2 className="font-semibold text-base md:text-lg pb-2 border-b border-gray-300">
                    Personal Details
                  </h2>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    {/* Full Name  */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label
                        htmlFor="fullName"
                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Full Name"
                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                        type="text"
                        {...register('full_name')}
                      />
                      {errors.full_name && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors.full_name.message}
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
                      <Controller
                        name="date_of_birth"
                        control={control}
                        render={({ field }) => (
                          <Flatpickr
                            id="date_of_birth"
                            placeholder="Date of birth"
                            className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                            options={{ dateFormat: 'd-m-Y' }}
                            value={field.value ? new Date(field.value) : ''}
                            onChange={([date]) => {
                              const formattedDate =
                                moment(date).format('YYYY-MM-DD');
                              field.onChange(formattedDate);
                            }}
                          />
                        )}
                      />
                      {errors.date_of_birth && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors.date_of_birth.message}
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label
                        htmlFor="phoneName"
                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        Phone Number
                      </Label>
                      <Input
                        id="phoneName"
                        placeholder="Phone Number"
                        className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const input = e.target;
                          if (input.value.length > 10) {
                            input.value = input.value.slice(0, 10);
                          }
                        }}
                        {...register('phone_number')}
                      />
                      {errors.phone_number && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors.phone_number.message}
                        </p>
                      )}
                    </div>

                    {/* Personal Email */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label
                        htmlFor="personalEmail"
                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        Personal Email
                      </Label>
                      <Input
                        id="personalEmail"
                        placeholder="Personal Email"
                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                        type="text"
                        {...register('personal_email')}
                      />
                      {errors.personal_email && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors.personal_email.message}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    {[ROLE.EMPLOYEE, ROLE.HR].includes(userData?.user_type) && (
                      <div className="col-span-2">
                        <Label
                          htmlFor="address"
                          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                        >
                          Address
                        </Label>
                        <TextArea
                          id="address"
                          placeholder="Enter address"
                          className="w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                          {...register('address')}
                        />
                      </div>
                    )}

                    {/* Country */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Country
                      </Label>
                      <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                          <Select
                            endPoints={apiHandler.countryHandler.lookup}
                            filterStr={`value_code=`}
                            placeholder="Select Country"
                            value={field.value}
                            objKey="country"
                            display="name"
                            func={handleSetValue}
                          />
                        )}
                      />
                      {errors.country && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors.country.message}
                        </p>
                      )}
                    </div>

                    {/* City */}
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        City
                      </Label>
                      <Controller
                        name="city"
                        control={control}
                        render={({ field }) => {
                          return (
                            <Select
                              isDisabled={!selectedCountry}
                              endPoints={apiHandler.CityHandler.lookup}
                              filterStr={`country_id=${selectedCountry ?? ''}`}
                              placeholder="Select City"
                              value={field.value}
                              objKey="city"
                              display="name"
                              func={handleSetValue}
                            />
                          );
                        }}
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    {userData?.user_type === ROLE.ADMIN && (
                      <>
                        <div className="col-span-2 sm:col-span-1">
                          <Label
                            htmlFor="companyEmail"
                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                          >
                            Company Email
                          </Label>
                          <Input
                            disabled={true}
                            id="companyEmail"
                            placeholder="Company Email"
                            className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                            type="text"
                            {...register('company_email')}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  {[ROLE.EMPLOYEE, ROLE.HR].includes(userData?.user_type) && (
                    <>
                      {/* Professional Details Section */}
                      <h1 className="font-semibold text-base md:text-lg py-2 border-b border-gray-300">
                        Professional Details
                      </h1>

                      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        {/* Company Email */}
                        <div className="col-span-2 sm:col-span-1">
                          <Label
                            htmlFor="companyEmail"
                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                          >
                            Company Email
                          </Label>
                          <Input
                            disabled={true}
                            id="companyEmail"
                            placeholder="Company Email"
                            className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                            type="text"
                            {...register('company_email')}
                          />
                        </div>

                        {/* Designation */}
                        <div className="col-span-2 sm:col-span-1">
                          <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Designation
                          </Label>
                          <Controller
                            name="designation"
                            control={control}
                            render={({ field }) => (
                              <Select
                                isDisabled
                                endPoints={
                                  apiHandler.lookupValueHandler.lookupValue
                                }
                                filterStr={`value_code=DESIGNATION`}
                                placeholder="Select Designation"
                                value={field.value}
                                objKey="designation"
                                func={handleSetValue}
                                display="name"
                              />
                            )}
                          />
                        </div>

                        {/* Department */}
                        <div className="col-span-2 sm:col-span-1">
                          <Label
                            htmlFor="department"
                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                          >
                            Department
                          </Label>
                          <Controller
                            name="department"
                            control={control}
                            render={({ field }) => (
                              <Select
                                isDisabled
                                endPoints={
                                  apiHandler.lookupValueHandler.lookupValue
                                }
                                filterStr={`value_code=DEPARTMENT`}
                                placeholder="Select Department"
                                value={field.value}
                                objKey="department"
                                disabledOptions={field.value}
                                display="name"
                                func={handleSetValue}
                                multiple
                              />
                            )}
                          />
                        </div>

                        {/* Joining Date */}
                        <div className="col-span-2 sm:col-span-1">
                          <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Joining Date
                          </Label>
                          <Controller
                            name="joining_date"
                            control={control}
                            render={({ field }) => (
                              <Flatpickr
                                disabled
                                id="joining_date"
                                placeholder="Joining Date"
                                className=" cursor-not-allowed h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                                options={{ dateFormat: 'd-m-Y' }}
                                value={field.value ? new Date(field.value) : ''}
                                onChange={([date]) => {
                                  const formattedDate =
                                    moment(date).format('YYYY-MM-DD');
                                  field.onChange(formattedDate);
                                }}
                              />
                            )}
                          />
                          {errors.joining_date && (
                            <p className="mt-1 text-sm text-error-500">
                              {errors.joining_date.message}
                            </p>
                          )}
                        </div>

                        {/* Skills */}
                        <div className="col-span-2 sm:col-span-1">
                          <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Skills
                          </Label>
                          <Controller
                            name="skills"
                            control={control}
                            render={({ field }) => (
                              <Select
                                endPoints={
                                  apiHandler.lookupValueHandler.lookupValue
                                }
                                filterStr={`value_code=SKILL`}
                                placeholder="Select Skill"
                                value={field.value}
                                objKey="skills"
                                disabledOptions={field.value}
                                display="name"
                                func={handleSetValue}
                                multiple
                              />
                            )}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {[ROLE.EMPLOYEE, ROLE.HR].includes(userData?.user_type) && (
                    <>
                      <h1 className="font-semibold text-base md:text-lg py-2 border-b border-gray-300">
                        Emergency Contact Details
                      </h1>

                      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
                        {/* <style>
                          {`.css-c4y430-MuiFormControl-root-MuiTextField-root .MuiInputBase-root {
                          padding: 2px 16px !important};
                        `}
                        </style> */}
                        <div className="col-span-2 sm:col-span-1">
                          <Label
                            htmlFor="emergency.name"
                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                          >
                            Name
                          </Label>
                          <div className="relative">
                            <Input
                              id="emergency.name"
                              placeholder="Enter Person Name"
                              className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                              type="text"
                              {...register('emergency.name')}
                            />
                          </div>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <Label
                            htmlFor="emergency.phoneNumber"
                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                          >
                            Phone Number
                          </Label>
                          <div className="relative">
                            <Input
                              id="emergency.phoneNumber"
                              placeholder="Enter Person Phone Number"
                              className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={10}
                              onInput={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) => {
                                const input = e.target;
                                if (input.value.length > 10) {
                                  input.value = input.value.slice(0, 10);
                                }
                              }}
                              {...register('emergency.phoneNumber')}
                            />
                          </div>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <Label
                            htmlFor="emergency.relation"
                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                          >
                            Relation
                          </Label>
                          <div className="relative">
                            <Input
                              id="emergency.relation"
                              placeholder="Enter Relation With Person"
                              className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                              type="text"
                              {...register('emergency.relation')}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <AnimatedButton
                  variant="secondary"
                  size="sm"
                  onClick={closeModal}
                >
                  Close
                </AnimatedButton>
                <AnimatedButton variant="primary" size="md">
                  Save Changes
                </AnimatedButton>
              </div>
            </form>
          </div>
        </Modal>
      </div>

      {/* Emergency section  */}
      {[ROLE.EMPLOYEE, ROLE.HR].includes(userData?.user_type) &&
        !isEmpty(userData?.emergency) && (
          <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 space-y-6">
              <h2 className="text-lg font-semibold mt-3 text-gray-800 dark:text-white/90 lg:mb-3">
                Emergency Contact Details
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-4 2xl:gap-x-32">
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Person Name :
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {userData?.emergency?.name}
                    </p>
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Phone Number :
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {userData?.emergency?.phoneNumber}
                    </p>
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Relation :
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {userData?.emergency?.relation}
                    </p>
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
    </>
  );
}
