import { yupResolver } from '@hookform/resolvers/yup';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import * as yup from 'yup';
import { apiHandler } from '../../../api/apiHandler';
import { CalenderIcon } from '../../../icons';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { ROLE } from '../../../utils/Constant';
import { showToast } from '../../../utils/helper';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import Label from '../../form/Label';
import Select from '../../form/Select';
import TextArea from '../../form/input/TextArea';
import AnimatedButton from '../../ui/AnimatedButton';

function TimesheetCreate() {
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');
  const id: any = searchParams.get('id');

  const navigate = useNavigate();

  const [viewData, setViewData] = useState<any>(null);
  const dispatch = useAppDispatch();
  const userData: any = useAppSelector((state) => state?.user);

  const validationSchema = yup.object().shape({
    project_id: yup.string().trim().required('Project Name is required'),
    task_status: yup.string().trim().required('Status is required'),
    hours: yup.string().required('Hours is required'),
    date: yup.string().trim().required('Date is required'),
    task_details: yup.string().trim().required('Task Details is required'),
    // task_id: yup.string().trim().required('Task is required'),
    task_id: yup.string().nullable(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      project_id: '',
      task_status: '',
      hours: '',
      date: '',
      task_details: '',
      task_id: null,
    },
  });

  const handleSave = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));
      const { data } =
        action === 'edit'
          ? await apiHandler.TimesheetHandler.update(id, payload)
          : await apiHandler.TimesheetHandler.create(payload);

      navigate(-1);
      showToast('success', data?.message);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleFetchTimesheet = async (ID: string) => {
    try {
      dispatch(setIsLoading(true));
      const { data } = await apiHandler.TimesheetHandler.get(ID);
      setViewData(data?.data);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleSetValue = useCallback(
    (key: any, value: any) => {
      setValue(key, value._id);
      if (key === 'project_id') {
        setValue('task_id', null);
      }
    },
    [setValue],
  );

  useEffect(() => {
    if (id) handleFetchTimesheet(id);
  }, [id, action]);

  useEffect(() => {
    if (viewData) {
      reset({
        project_id: viewData?.project_id?._id,
        task_status: viewData?.task_status?._id,
        date: viewData?.date,
        hours: viewData?.hours,
        task_details: viewData?.task_details,
        task_id: viewData?.task_id,
      });
    }
  }, [viewData, reset, id]);

  return (
    <div>
      <PageBreadcrumb
        pageTitle={`${
          action === 'edit' ? 'Edit' : action === 'view' ? 'View' : 'Create'
        } Timesheet`}
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
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
          <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Project */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Select Project
                </Label>
                <Controller
                  name="project_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      endPoints={apiHandler.ProjectHandler.lookup}
                      isDisabled={action === 'view'}
                      filterStr={`members=${
                        [ROLE.EMPLOYEE, ROLE.HR].includes(userData?.user_type)
                          ? userData?._id
                          : ''
                      }`}
                      display="name"
                      objKey="project_id"
                      func={handleSetValue}
                      placeholder="Select Project"
                      value={field.value}
                    />
                  )}
                />
                {errors.project_id && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.project_id.message}
                  </p>
                )}
              </div>
              {/* Select Task */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="task_id"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Select Task
                </Label>
                <Controller
                  name="task_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      isDisabled={action === 'view' || !watch('project_id')}
                      endPoints={apiHandler.TaskHandler.lookup}
                      filterStr={`project_id=${watch(
                        'project_id',
                      )}&assigned_to=${
                        [ROLE.EMPLOYEE, ROLE.HR].includes(userData?.user_type)
                          ? userData?._id
                          : ''
                      }`}
                      placeholder="Select Task"
                      value={field.value || ''}
                      objKey="task_id"
                      func={handleSetValue}
                      display="task_name"
                    />
                  )}
                />
              </div>
              {/* Date */}
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="datePicker">Date</Label>
                <div className="relative w-full flatpickr-wrapper">
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                      <Flatpickr
                        disabled={action === 'view'}
                        placeholder="Select Date"
                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                        options={{
                          dateFormat: 'd-m-Y',
                          maxDate: new Date(),
                        }}
                        value={field.value ? new Date(field.value) : ''}
                        onChange={([date]) => {
                          if (date) {
                            const formattedDate = flatpickr.formatDate(
                              date,
                              'Y-m-d',
                            );
                            field.onChange(formattedDate);
                          } else {
                            field.onChange(null);
                          }
                        }}
                      />
                    )}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <CalenderIcon className="size-6" />
                  </span>
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.date.message}
                  </p>
                )}
              </div>
              {/* Hours */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="hours"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Hours
                </Label>
                <Controller
                  name="hours"
                  control={control}
                  render={({ field }) => (
                    <Flatpickr
                      disabled={action === 'view'}
                      options={{
                        enableTime: true,
                        noCalendar: true,
                        dateFormat: 'H:i',
                        time_24hr: true,
                        maxTime: '12',
                        minTime: '1',
                      }}
                      value={field.value}
                      readOnly={action === 'view'}
                      placeholder="00:00"
                      onChange={(_, dateStr) => field.onChange(dateStr)}
                      className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300`}
                    />
                  )}
                />
                {errors.hours && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.hours.message}
                  </p>
                )}
              </div>
              {/* Task Status */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="task_status"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Task Status
                </Label>
                <Controller
                  name="task_status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      isDisabled={action === 'view'}
                      endPoints={apiHandler.lookupValueHandler.lookupValue}
                      filterStr={`value_code=TASK_STATUS`}
                      placeholder="Select Status"
                      value={field.value}
                      objKey="task_status"
                      func={handleSetValue}
                      display="name"
                    />
                  )}
                />
                {errors.task_status && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.task_status.message}
                  </p>
                )}
              </div>
              {/* Task Description */}
              <div className="col-span-2 sm:col-span-1">
                <Label>Task Description</Label>
                <TextArea
                  rows={6}
                  placeholder="Enter Your Task Details"
                  {...register('task_details')}
                  readOnly={action === 'view'}
                />
                {errors.task_details && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.task_details.message}
                  </p>
                )}
              </div>
            </div>
            {action !== 'view' && (
              <div className="col-span-2 flex justify-end">
                <AnimatedButton type="submit" variant="primary" size="md">
                  {action === 'edit' ? 'Update Timesheet' : 'Create Timesheet'}
                </AnimatedButton>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default TimesheetCreate;
