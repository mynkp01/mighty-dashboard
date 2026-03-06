import { yupResolver } from '@hookform/resolvers/yup';
import Flatpickr from 'react-flatpickr';

import 'flatpickr/dist/flatpickr.min.css';
import { ArrowLeft } from 'lucide-react';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import * as yup from 'yup';
import { apiHandler } from '../../../api/apiHandler';
import { EyeCloseIcon, EyeIcon } from '../../../icons';
import { useAppDispatch } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { ROLE } from '../../../utils/Constant';
import { emailRegex, showToast } from '../../../utils/helper';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Select from '../../form/Select';
import AnimatedButton from '../../ui/AnimatedButton';

function UserOption() {
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const action = searchParams?.get('action');
  const id: any = searchParams?.get('id');

  const validationSchema = yup.object().shape({
    full_name: yup.string().trim().required('Full Name is required'),
    phone_number: yup.string().trim().required('Contact Number is required'),
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
    date_of_birth: yup.string().trim().required('Date of birth is required'),
    country: yup.string().trim().required('Country is required'),
    city: yup.string().trim().required('City is required'),
    module: yup
      .array()
      .min(1, 'At least one module is required')
      .required('At least one module is required'),
    password:
      action === 'edit'
        ? yup.string()
        : yup.string().trim().required('Password is required'),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      full_name: '',
      phone_number: '',
      company_email: '',
      personal_email: '',
      date_of_birth: '',
      password: '',
      country: '',
      city: '',
      module: [],
    },
  });

  const handleSave = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));

      const { data } =
        action === 'edit'
          ? await apiHandler.userHandler.update(id, {
              ...payload,
              user_type: ROLE.ADMIN,
            })
          : await apiHandler.userHandler.create({
              ...payload,
              user_type: ROLE.ADMIN,
            });

      navigate(-1);
      showToast('success', data?.message);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleFetchUser = async (UserId: string) => {
    try {
      dispatch(setIsLoading(true));
      const { data } = await apiHandler.userHandler.get(UserId);
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
        full_name: userData?.full_name,
        phone_number: userData?.phone_number,
        company_email: userData?.company_email,
        personal_email: userData?.personal_email,
        date_of_birth: userData?.date_of_birth,
        country: userData?.country,
        city: userData?.city,
        module: userData?.module?.map((v: any) => v?._id?.toString()),
      });
    }
  }, [userData, reset]);

  const handleSetValue = useCallback(
    (key: any, value: any) => {
      if (Array.isArray(value)) {
        setValue(
          key,
          value.map((v) => v?._id),
        );
      } else if (typeof value === 'object') {
        setValue(key, value?._id || '');
      } else {
        setValue(key, value);
      }
    },
    [setValue],
  );

  const selectedCountry = watch('country');

  return (
    <>
      <PageBreadcrumb pageTitle="Manage Users" />
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
          <div className="space-y-6">
            <form onSubmit={handleSubmit(handleSave)} className="space-y-5">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* Name  */}
                <div className="col-span-2 sm:col-span-1">
                  <Label
                    htmlFor="full_name"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Name
                  </Label>
                  <Input
                    readOnly={action === 'view'}
                    placeholder="Enter Name"
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
                {/* Personal Email */}
                <div className="col-span-2 sm:col-span-1">
                  <Label
                    htmlFor="personal_email"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Personal Email
                  </Label>
                  <Input
                    autoComplete="Personal Email"
                    readOnly={action === 'view'}
                    id="personal_email"
                    placeholder="Enter Personal Email"
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
                {/* Date of Birth */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Date of Birth
                  </Label>
                  <Controller
                    name="date_of_birth"
                    control={control}
                    render={({ field }) => (
                      <Flatpickr
                        disabled={action === 'view'}
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
                {/* Contact Number */}
                <div className="col-span-2 sm:col-span-1">
                  <Label
                    htmlFor="phone_number"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Contact Number
                  </Label>
                  <Input
                    readOnly={action === 'view'}
                    id="phone_number"
                    placeholder="Enter Contact Number"
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
                  {errors.city && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.city.message}
                    </p>
                  )}
                </div>
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
                    placeholder="Enter Company Email"
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
                {/* Password */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view' || action === 'edit'}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      placeholder="Password"
                      autoComplete="current-password"
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
              {action !== 'view' && (
                <div className="col-span-2 flex justify-end">
                  <AnimatedButton type="submit" variant="primary" size="md">
                    {action === 'edit' ? 'Update User' : 'Create User'}
                  </AnimatedButton>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserOption;
