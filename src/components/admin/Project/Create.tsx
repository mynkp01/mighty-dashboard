import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft } from 'lucide-react';
import Flatpickr from 'react-flatpickr';

import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import * as yup from 'yup';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { showToast } from '../../../utils/helper';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import Input from '../../form/input/InputField';
import TextArea from '../../form/input/TextArea';
import Label from '../../form/Label';
import Select from '../../form/Select';
import AnimatedButton from '../../ui/AnimatedButton';

function ProjectCreate() {
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');
  const id: any = searchParams.get('id');
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);

  const validationSchema = yup.object().shape({
    name: yup.string().trim().required('Name is required'),
    status: yup.string().trim().required('Status is required'),
    estimated_hours: yup.string().required('Estimated Hours is required'),
    available_hours: yup.string().required('Available Hours is required'),
    client_details: yup.string().trim().required('Client Details is required'),
    members: yup
      .array()
      .min(1, 'Members is required')
      .required('Members is required'),
    available_budget: yup.string().required('Available budget is required'),
    estimated_budget: yup.string().required('Estimated Budget is required'),
    start_date: yup.string().trim().required('Start Date is required'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: '',
      status: '',
      estimated_hours: '',
      available_hours: '',
      client_details: '',
      members: [],
      available_budget: '',
      start_date: '',
      estimated_budget: '',
    },
  });

  const estimatedHours = watch('estimated_hours');
  const estimatedBudget = watch('estimated_budget');

  useEffect(() => {
    if (!id) {
      setValue('available_hours', estimatedHours);
      setValue('available_budget', estimatedBudget);
    }
  }, [estimatedHours, estimatedBudget, setValue]);

  const handleSave = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));

      payload = {
        ...payload,
        estimated_hours: Number(payload?.estimated_hours),
        available_hours: Number(payload?.available_hours),
        available_budget: Number(payload?.available_budget),
        estimated_budget: Number(payload?.estimated_budget),
      };

      const { data } =
        action === 'edit'
          ? await apiHandler.ProjectHandler.update(id, payload)
          : await apiHandler.ProjectHandler.create(payload);

      navigate(-1);
      showToast('success', data?.message);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleFetchLookupCategory = async (ID: string) => {
    try {
      dispatch(setIsLoading(true));
      const { data } = await apiHandler.ProjectHandler.get(ID);
      setData(data?.data);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    if (id) {
      handleFetchLookupCategory(id);
    }
  }, [id, action]);

  useEffect(() => {
    if (data) {
      reset({
        name: data?.name,
        status: data?.status?._id,
        client_details: data?.client_details,
        members: data?.members?.map((i: any) => i._id),
        estimated_hours: data?.estimated_hours,
        available_hours: data?.available_hours,
        available_budget: data?.available_budget,
        estimated_budget: data?.estimated_budget,
        start_date: data?.start_date
          ? new Date(data?.start_date).toISOString().split('T')[0]
          : '',
      });
    }
  }, [data, reset]);

  const handleSetValue = useCallback(
    (key: any, value: any) => {
      if (Array.isArray(value)) {
        setValue(
          key,
          value.map((v) => v?._id),
        );
      } else {
        setValue(key, value?._id || '');
      }
    },
    [setValue],
  );

  return (
    <div>
      <PageBreadcrumb
        pageTitle={`${
          action === 'edit' ? 'Edit' : action === 'view' ? 'View' : 'Create'
        } Project`}
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
          <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Project Name */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Project Name
                </Label>
                <div className="relative">
                  <Input
                    readOnly={action === 'view'}
                    id="name"
                    placeholder="Enter Name"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    type="text"
                    {...register('name')}
                  />
                </div>
                {errors?.name && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors?.name.message}
                  </p>
                )}
              </div>
              {/* Client Details */}
              <div className="col-span-2 sm:col-span-1">
                <Label>Client Details</Label>
                <TextArea
                  rows={(watch('client_details').length % 100) / 12}
                  placeholder="Enter Client Details"
                  {...register('client_details')}
                  readOnly={action === 'view'}
                />
                {errors.client_details && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.client_details.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Start Date */}
              <div>
                <Label
                  htmlFor="start_date"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Start Date
                </Label>
                <div className="relative">
                  <Controller
                    name="start_date"
                    control={control}
                    render={({ field }) => (
                      <Flatpickr
                        disabled={action === 'view'}
                        id="start_date"
                        placeholder="Start Date"
                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                        options={{ dateFormat: 'd-m-Y' }}
                        value={field.value ? new Date(field?.value) : ''}
                        onChange={([date]) => {
                          const formattedDate =
                            moment(date).format('YYYY-MM-DD');
                          field.onChange(formattedDate);
                        }}
                      />
                    )}
                  />
                </div>
                {errors.start_date && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.start_date.message}
                  </p>
                )}
              </div>
              {/* Status */}
              <div>
                <Label
                  htmlFor="status"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Status
                </Label>
                <div className="relative">
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        isDisabled={action === 'view'}
                        endPoints={apiHandler.lookupValueHandler.lookupValue}
                        filterStr={`value_code=PROJECT_STATUS`}
                        placeholder="Select Status"
                        value={field.value}
                        objKey="status"
                        func={handleSetValue}
                        display="name"
                      />
                    )}
                  />
                </div>
                {errors?.status && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors?.status.message}
                  </p>
                )}
              </div>
              {/* Select Employee */}
              <div>
                <Label
                  htmlFor="status"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Select Employee
                </Label>
                <div className="relative">
                  <Controller
                    name="members"
                    control={control}
                    render={({ field }) => (
                      <Select
                        isDisabled={action === 'view'}
                        endPoints={apiHandler.userHandler.lookup}
                        filterStr={`user_type=`}
                        placeholder="Select Employee"
                        value={field.value}
                        objKey="members"
                        disabledOptions={field.value}
                        display="full_name"
                        func={handleSetValue}
                        multiple
                      />
                    )}
                  />
                </div>
                {errors.members && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.members.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              {/* Estimated Hours */}
              <div>
                <Label
                  htmlFor="estimated_hours"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Estimated Hours
                </Label>
                <div className="relative">
                  <Input
                    id="estimated_hours"
                    readOnly={action === 'view'}
                    placeholder="Estimated Hours"
                    className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                    type="number"
                    {...register('estimated_hours')}
                    inputMode="numeric"
                    maxLength={4}
                    pattern="\d*"
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const input = e.target;
                      input.value = input.value.replace(/\D/g, '').slice(0, 4);
                    }}
                  />
                </div>
                {errors?.estimated_hours && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors?.estimated_hours.message}
                  </p>
                )}
              </div>
              {/* Available Hours */}
              <div>
                <Label
                  htmlFor="available_hours"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Available Hours
                </Label>
                <div className="relative">
                  <Input
                    readOnly
                    placeholder="Available Hours"
                    className=" cursor-not-allowed h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                    type="number"
                    {...register('available_hours')}
                  />
                </div>
                {errors?.available_hours && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors?.available_hours.message}
                  </p>
                )}
              </div>
              {/* Estimated Budget */}
              <div>
                <Label
                  htmlFor="status"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Estimated Budget
                </Label>
                <div className="relative">
                  <Input
                    id="estimated_budget"
                    readOnly={action === 'view'}
                    placeholder="Estimated Budget"
                    className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                    type="number"
                    {...register('estimated_budget')}
                    inputMode="numeric"
                    maxLength={10}
                    pattern="\d*"
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const input = e.target;
                      input.value = input.value.replace(/\D/g, '').slice(0, 10);
                    }}
                  />
                </div>
                {errors?.estimated_budget && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors?.estimated_budget.message}
                  </p>
                )}
              </div>
              {/* Available Budget */}
              <div>
                <Label
                  htmlFor="status"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Available Budget
                </Label>
                <div className="relative">
                  <Input
                    id="available_budget"
                    readOnly
                    placeholder="Available Budget"
                    className="cursor-not-allowed h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                    type="number"
                    {...register('available_budget')}
                  />
                </div>
                {errors?.available_budget && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors?.available_budget.message}
                  </p>
                )}
              </div>
            </div>
            {action !== 'view' && (
              <div className="col-span-2 flex justify-end">
                <AnimatedButton type="submit" variant="primary" size="md">
                  {action === 'edit' ? 'Update Project' : 'Create Project'}
                </AnimatedButton>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProjectCreate;
