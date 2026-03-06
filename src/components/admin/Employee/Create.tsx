import { yupResolver } from '@hookform/resolvers/yup';
import 'flatpickr/dist/flatpickr.min.css';
import { ArrowLeft } from 'lucide-react';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import * as yup from 'yup';
import { apiHandler } from '../../../api/apiHandler';
import { EyeCloseIcon, EyeIcon } from '../../../icons';
import { useAppDispatch } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { ROLE } from '../../../utils/Constant';
import { emailRegex, isEmpty, showToast } from '../../../utils/helper';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import Input from '../../form/input/InputField';
import TextArea from '../../form/input/TextArea';
import Label from '../../form/Label';
import Select from '../../form/Select';
import AnimatedButton from '../../ui/AnimatedButton';

function EmployeeCreate() {
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const action = searchParams.get('action');
  const id: any = searchParams.get('id');

  const validationSchema = yup.object().shape({
    user_type: yup.string().trim().required('Please select user type'),
    full_name: yup.string().trim().required('Full Name is required'),
    phone_number: yup.string().trim().required('Phone Number is required'),
    designation: yup.string().trim().required('Designation is required'),
    department: yup
      .array()
      .min(1, 'Department is required')
      .required('Department is required'),
    company_email: yup
      .string()
      .trim()
      .required('Company Email is required')
      .matches(emailRegex, 'Invalid Email'),
    personal_email: yup
      .string()
      .trim()
      .required('Personal Email is required')
      .matches(emailRegex, 'Invalid Email'),
    salary: yup.string().trim().required('Salary is required'),
    joining_date: yup.string().trim().required('Joining Date is required'),
    date_of_birth: yup.string().trim().required('Joining Date is required'),
    skills: yup
      .array()
      .min(1, 'Skill is required')
      .required('Skill is required'),
    password:
      action === 'edit'
        ? yup.string().trim()
        : yup.string().trim().required('Password is required'),
    emergency: yup.object({
      name: yup.string().trim(),
      relation: yup.string().trim(),
      phoneNumber: yup.string().trim(),
    }),
    address: yup.string(),
    country: yup.string().trim().required('Country is required'),
    city: yup.string().trim().required('City is required'),
    module: yup
      .array()
      .min(1, 'At least one module is required')
      .required('At least one module is required'),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      user_type: '',
      full_name: '',
      phone_number: '',
      designation: '',
      department: [],
      company_email: '',
      personal_email: '',
      salary: '',
      joining_date: '',
      date_of_birth: '',
      skills: [],
      module: [],
      password: '',
      address: '',
      city: '',
      country: '',
      emergency: {
        name: '',
        relation: '',
        phoneNumber: '',
      },
    },
  });

  const handleSave = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));

      const { data } =
        action === 'edit'
          ? await apiHandler.userHandler.update(id, {
              ...payload,
            })
          : await apiHandler.userHandler.create({
              ...payload,
            });
      navigate(-1);
      showToast('success', data?.message);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleFetchUser = async (EmpId: string) => {
    try {
      dispatch(setIsLoading(true));
      const { data } = await apiHandler.userHandler.get(EmpId);
      setUserData(data?.data);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    if (id) {
      handleFetchUser(id);
    }
  }, [id, action]);

  useEffect(() => {
    if (userData) {
      reset({
        user_type: userData?.user_type,
        full_name: userData?.full_name,
        phone_number: userData?.phone_number,
        designation: userData?.designation,
        department: userData?.department || [],
        module: userData?.module?.map((i: any) => i?._id) || [],
        company_email: userData?.company_email,
        personal_email: userData?.personal_email,
        salary: userData?.salary,
        password: userData?.password,
        joining_date: userData?.joining_date
          ? new Date(userData?.joining_date).toISOString().split('T')[0]
          : '',
        date_of_birth: userData?.date_of_birth
          ? new Date(userData?.date_of_birth).toISOString().split('T')[0]
          : '',
        skills: userData?.skills || [],
        address: userData?.address || '',
        city: userData?.city || '',
        country: userData?.country || '',
        emergency: !isEmpty(userData?.emergency)
          ? userData?.emergency
          : {
              name: '',
              relation: '',
              phoneNumber: '',
            },
      });
    }
  }, [userData, reset]);

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

  const selectedCountry = watch('country');

  return (
    <div>
      <PageBreadcrumb
        pageTitle={`${
          action === 'edit' ? 'Edit' : action === 'view' ? 'View' : 'Create'
        } Employee`}
      />
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
          <form onSubmit={handleSubmit(handleSave)} className="space-y-5">
            {/* Personal Details Section */}
            <h2 className="font-semibold text-base md:text-lg pb-2 border-b border-gray-300 mb-4">
              Personal Details
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {/* Full Name */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="fullName"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Full Name
                </Label>
                <Input
                  readOnly={action === 'view'}
                  id="fullName"
                  placeholder="Enter Full Name"
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
                  htmlFor="date_of_birth"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Date of Birth
                </Label>
                <Controller
                  name="date_of_birth"
                  control={control}
                  render={({ field }) => (
                    <Flatpickr
                      disabled={action === 'view'}
                      id="date_of_birth"
                      placeholder="Date of Birth"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      options={{ dateFormat: 'd-m-Y', maxDate: new Date() }}
                      value={field.value ? new Date(field.value) : ''}
                      onChange={([date]) => {
                        const formattedDate = moment(date).format('YYYY-MM-DD');
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
                  htmlFor="phone_number"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Phone Number
                </Label>
                <Input
                  readOnly={action === 'view'}
                  id="phone_number"
                  placeholder="Enter Phone Number"
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
                  htmlFor="personal_email"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Personal Email
                </Label>
                <Input
                  readOnly={action === 'view'}
                  id="personal_email"
                  placeholder="Enter Personal Email Address"
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                  {...register('personal_email')}
                />
                {errors.personal_email && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.personal_email.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="col-span-2 sm:col-span-2">
                <Label
                  htmlFor="address"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Address
                </Label>
                <TextArea
                  readOnly={action === 'view'}
                  id="address"
                  placeholder="Enter address"
                  className="h-20 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                  {...register('address')}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.address.message}
                  </p>
                )}
              </div>

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
                      isDisabled={action === 'view'}
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
                        isDisabled={action === 'view' || !selectedCountry}
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
                {errors?.city && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors?.city.message}
                  </p>
                )}
              </div>
            </div>

            {/* Professional Details Section */}
            <h1 className="font-semibold text-base md:text-lg py-2 border-b border-gray-300 mb-4">
              Professional Details
            </h1>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
              {/* Company Email */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="company_email"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Company Email
                </Label>
                <Input
                  readOnly={action === 'view'}
                  id="company_email"
                  placeholder="Enter Company Email Address"
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                  type="text"
                  {...register('company_email')}
                />
                {errors.company_email && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.company_email.message}
                  </p>
                )}
              </div>

              {/* Designation */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="designation"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Designation
                </Label>
                <Controller
                  name="designation"
                  control={control}
                  render={({ field }) => (
                    <Select
                      isDisabled={action === 'view'}
                      endPoints={apiHandler.lookupValueHandler.lookupValue}
                      filterStr={`value_code=DESIGNATION`}
                      placeholder="Select Designation"
                      value={field.value}
                      objKey="designation"
                      func={handleSetValue}
                      display="name"
                    />
                  )}
                />
                {errors.designation && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.designation.message}
                  </p>
                )}
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
                      isDisabled={action === 'view'}
                      endPoints={apiHandler.lookupValueHandler.lookupValue}
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
                {errors.department && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.department.message}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="skills"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Skills
                </Label>
                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <Select
                      isDisabled={action === 'view'}
                      endPoints={apiHandler.lookupValueHandler.lookupValue}
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
                {errors.skills && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.skills.message}
                  </p>
                )}
              </div>

              {/* Joining Date */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="joining_date"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Joining Date
                </Label>
                <Controller
                  name="joining_date"
                  control={control}
                  render={({ field }) => (
                    <Flatpickr
                      disabled={action === 'view'}
                      id="joining_date"
                      placeholder="Joining Date"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      options={{ dateFormat: 'd-m-Y', maxDate: new Date() }}
                      value={field.value ? new Date(field.value) : ''}
                      onChange={([date]) => {
                        const formattedDate = moment(date).format('YYYY-MM-DD');
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

              {/* Salary */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="salary"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Salary
                </Label>
                <Input
                  id="salary"
                  readOnly={action === 'view'}
                  placeholder="Salary"
                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                  type="number"
                  {...register('salary')}
                  inputMode="numeric"
                  maxLength={7}
                  pattern="\d*"
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const input = e.target;
                    input.value = input.value.replace(/\D/g, '').slice(0, 7);
                  }}
                />
                {errors.salary && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.salary.message}
                  </p>
                )}
              </div>
            </div>

            {/* Account Security Section */}
            <h1 className="font-semibold text-base md:text-lg py-2 border-b border-gray-300 mb-4">
              Account Security
            </h1>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
              {/* Employee Type */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Employee Type
                </Label>
                <Controller
                  name="user_type"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Select
                        isDisabled={action === 'view'}
                        placeholder="Select employee type"
                        data={Object.keys(ROLE)
                          .filter((i) => i !== ROLE.ADMIN)
                          .map((i) => ({
                            _id: i,
                            name: i?.charAt(0)?.toUpperCase() + i?.slice(1),
                          }))}
                        value={field.value}
                        objKey="user_type"
                        display="name"
                        func={handleSetValue}
                        // defaultValueKey="value_code"
                        defaultValueIndex={[ROLE.EMPLOYEE]}
                      />
                    );
                  }}
                />
                {errors.module && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.module.message}
                  </p>
                )}
              </div>
              {/* Password */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    readOnly={action === 'view'}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Password"
                    className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                    {...register('password')}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Module */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Assign Module
                </Label>
                <Controller
                  name="module"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Select
                        isDisabled={action === 'view'}
                        endPoints={apiHandler.lookupValueHandler.lookupValue}
                        filterStr={`value_code=SYSTEM_MODULE`}
                        placeholder="Select Module"
                        value={field.value}
                        multiple
                        objKey="module"
                        display="name"
                        func={handleSetValue}
                        defaultValueKey="value_code"
                        defaultValueIndex={['TIMESHEET', 'TASK_MANAGEMENT']}
                      />
                    );
                  }}
                />
                {errors.module && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.module.message}
                  </p>
                )}
              </div>
            </div>

            {/* Emergency Contact Details Section */}
            <div>
              <h1 className="font-semibold text-base md:text-lg py-2 border-b border-gray-300 mb-4">
                Emergency Contact Details
              </h1>
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3 py-2">
                {/* Emergency Contact Name */}
                <div className="col-span-2 sm:col-span-1">
                  <Label
                    htmlFor="emergency_name"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Contact Person Name
                  </Label>
                  <Input
                    readOnly={action === 'view'}
                    id="emergency_name"
                    placeholder="Enter Person Name"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    type="text"
                    {...register('emergency.name')}
                  />
                </div>

                {/* Emergency Contact Phone */}
                <div className="col-span-2 sm:col-span-1">
                  <Label
                    htmlFor="emergency_phone"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Contact Person Phone
                  </Label>
                  <Input
                    readOnly={action === 'view'}
                    id="emergency_phone"
                    placeholder="Enter Person Phone Number"
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
                    {...register('emergency.phoneNumber')}
                  />
                </div>

                {/* Emergency Contact Relation */}
                <div className="col-span-2 sm:col-span-1">
                  <Label
                    htmlFor="emergency_relation"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Relationship
                  </Label>
                  <Input
                    readOnly={action === 'view'}
                    id="emergency_relation"
                    placeholder="Enter Relation With Person"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    type="text"
                    {...register('emergency.relation')}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {action !== 'view' && (
              <div className="col-span-2 flex justify-end mt-4">
                <AnimatedButton type="submit" variant="primary" size="md">
                  {action === 'edit' ? 'Update Employee' : 'Create Employee'}
                </AnimatedButton>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default EmployeeCreate;
