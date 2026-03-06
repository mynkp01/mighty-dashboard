import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { useNavigate, useSearchParams } from 'react-router';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { ROLE } from '../../../utils/Constant';
import { isEmpty, showToast } from '../../../utils/helper';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import Input from '../../form/input/InputField';
import TextArea from '../../form/input/TextArea';
import Label from '../../form/Label';
import Select from '../../form/Select';
import AnimatedButton from '../../ui/AnimatedButton';

function TaskAction() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userData: any = useAppSelector((state) => state?.user);

  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');
  const id: any = searchParams.get('id');

  const [viewData, setViewData] = useState<any>(null);
  const [members, setMembers] = useState<any>([]);
  const [errors, setErrors] = useState<any>({});
  type FormDataType = {
    project_id: string;
    task_name: string;
    description: string;
    assigned_to: string[]; // or any[] if needed, but string[] is recommended
    due_date: string;
    start_date: string;
    status: string;
  };

  const [formData, setFormData] = useState<FormDataType>({
    project_id: '',
    task_name: '',
    description: '',
    assigned_to: [],
    due_date: '',
    start_date: '',
    status: '',
  });

  const validateForm = () => {
    const newErrors: any = {};

    // Basic field validations
    if (!formData.project_id.trim())
      newErrors.project_id = 'Project is required';
    if (!formData.task_name.trim())
      newErrors.task_name = 'Task Name is required';
    if (!formData.description.trim())
      newErrors.description = 'Description is required';
    if (!formData.assigned_to.length)
      newErrors.assigned_to = 'Assigned To is required';
    if (!formData.start_date) newErrors.start_date = 'Start Date is required';
    if (!formData.due_date) newErrors.due_date = 'Due Date is required';

    // Date comparison validation
    if (formData.start_date && formData.due_date) {
      const start = new Date(formData.start_date);
      const due = new Date(formData.due_date);

      if (due < start) {
        newErrors.due_date = 'Due Date cannot be earlier than Start Date';
      }
    }

    if (!formData.status.trim()) newErrors.status = 'Status is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        dispatch(setIsLoading(true));

        const { data } =
          action === 'edit'
            ? await apiHandler.TaskHandler.update(id, formData)
            : await apiHandler.TaskHandler.create(formData);

        navigate(-1);
        showToast('success', data?.message);
      } catch (error: any) {
        showToast('error', error?.message);
      } finally {
        dispatch(setIsLoading(false));
      }
    }
  };

  const handleFetchTask = async (ID: string) => {
    try {
      dispatch(setIsLoading(true));

      const { data } = await apiHandler.TaskHandler.get(ID);
      setViewData(data?.data);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleFetchMembers = async (id: string) => {
    try {
      dispatch(setIsLoading(true));
      const { data } = await apiHandler.ProjectHandler.get(id);
      setMembers(data?.data?.members);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    if (formData.project_id) handleFetchMembers(formData.project_id);
    if ([ROLE.EMPLOYEE, ROLE.HR].includes(userData?.user_type)) {
      setMembers((prev: any) => [
        ...prev,
        { _id: userData?._id, full_name: userData?.full_name },
      ]);
      setFormData((prev) => {
        return {
          ...prev,
          assigned_to: [...prev.assigned_to, userData?._id],
        };
      });
    }
  }, [formData.project_id]);

  useEffect(() => {
    if (id) {
      handleFetchTask(id);
    }
  }, [id, action]);

  const updateFormData = (field: string, value: any) => {
    let newValue = value;

    if (Array.isArray(value)) {
      newValue = value.map((item) => (item?._id ? item._id : item));
    } else if (typeof value === 'object' && value !== null && '_id' in value) {
      newValue = value?._id;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  useEffect(() => {
    if (id && viewData) {
      const validAssignedTo = viewData.assigned_to?.filter((assigned: any) =>
        members?.some((member: any) => member?._id === assigned),
      );

      setFormData((prev) => ({
        ...prev,
        ...viewData,
        assigned_to: validAssignedTo,
      }));
    }
  }, [id, viewData, members]);

  return (
    <div>
      <PageBreadcrumb
        pageTitle={`${
          action === 'edit' ? 'Edit' : action === 'view' ? 'View' : 'Create'
        } Task`}
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
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Project */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Project Name
                </Label>
                <div className="relative">
                  <Select
                    isDisabled={action === 'view'}
                    endPoints={apiHandler.ProjectHandler.lookup}
                    filterStr={`NA`}
                    placeholder="Select Project"
                    value={formData.project_id}
                    objKey="project_id"
                    func={updateFormData}
                    display="name"
                  />
                </div>
                {errors?.project_id && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors?.project_id}
                  </p>
                )}
              </div>
              {/* Assigned To */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Assigned To
                </Label>
                <div className="relative">
                  <Select
                    isDisabled={
                      action === 'view' ||
                      (isEmpty(formData?.project_id) &&
                        userData?.user_type === ROLE.ADMIN) ||
                      [ROLE.EMPLOYEE, ROLE.HR].includes(userData?.user_type)
                    }
                    data={members}
                    filterStr={''}
                    placeholder="Select User"
                    value={formData?.assigned_to}
                    objKey="assigned_to"
                    func={updateFormData}
                    display="full_name"
                    multiple
                    disabledOptions={formData?.assigned_to}
                  />
                </div>
                {errors?.assigned_to && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors?.assigned_to}
                  </p>
                )}
              </div>
              {/* Task Name */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Task Name
                </Label>
                <div className="relative">
                  <Input
                    value={formData.task_name}
                    readOnly={action === 'view'}
                    id="task_name"
                    placeholder="Enter Task Name"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    type="text"
                    onChange={(e) =>
                      updateFormData('task_name', e.target.value)
                    }
                  />
                </div>
                {errors.task_name && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.task_name}
                  </p>
                )}
              </div>
              {/* description */}
              <div className="col-span-2 sm:col-span-1">
                <Label>Description</Label>
                <TextArea
                  rows={4}
                  value={formData?.description}
                  placeholder="Enter Description"
                  readOnly={action === 'view'}
                  onChange={(e) =>
                    updateFormData('description', e.target.value)
                  }
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.description}
                  </p>
                )}
              </div>
              {/* Status  */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="designation"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Status
                </Label>
                <div className="relative">
                  <Select
                    isDisabled={action === 'view'}
                    endPoints={apiHandler.lookupValueHandler.lookupValue}
                    filterStr={`value_code=TASK_STATUS`}
                    placeholder="Select Status"
                    value={formData.status}
                    objKey="status"
                    display="name"
                    func={updateFormData}
                  />
                </div>
                {errors.status && (
                  <p className="mt-1 text-sm text-error-500">{errors.status}</p>
                )}
              </div>
              {/* Start Date */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Start Date
                </Label>
                <div className="relative">
                  <Flatpickr
                    disabled={action === 'view'}
                    placeholder="Select Start Date"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    value={
                      formData?.start_date ? new Date(formData?.start_date) : ''
                    }
                    onChange={([date]) => updateFormData('start_date', date)}
                    options={{
                      dateFormat: 'd-m-Y',
                    }}
                  />
                </div>
                {errors.start_date && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.start_date}
                  </p>
                )}
              </div>
              {/* Due Date */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Due Date
                </Label>
                <div className="relative">
                  <Flatpickr
                    disabled={action === 'view'}
                    placeholder="Select Due Date"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    value={formData.due_date ? new Date(formData.due_date) : ''}
                    onChange={([date]) => updateFormData('due_date', date)}
                    options={{
                      dateFormat: 'd-m-Y',
                      minDate:
                        formData.start_date ||
                        new Date(new Date().setHours(0, 0, 0, 0)),
                    }}
                  />
                </div>
                {errors.due_date && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.due_date}
                  </p>
                )}
              </div>
            </div>
            {action !== 'view' && (
              <div className="col-span-2 flex justify-end">
                <AnimatedButton variant="primary" type="submit" size="md">
                  Save
                </AnimatedButton>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default TaskAction;
