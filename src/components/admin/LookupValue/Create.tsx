import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft } from 'lucide-react';
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
import Label from '../../form/Label';
import Select from '../../form/Select';
import AnimatedButton from '../../ui/AnimatedButton';

function CategoryValueCreate() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any>(null);

  const navigate = useNavigate();

  const action = searchParams.get('action');
  const id: any = searchParams.get('id');

  const validationSchema = yup.object().shape({
    name: yup.string().trim().required('Value Name is required'),
    category_id: yup.string().trim().required('Category is required'),
    parent_category_id: yup.string().trim(),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    register,
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { name: '', category_id: '', parent_category_id: '' },
  });

  const handleSave = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));

      const { data } =
        action === 'edit'
          ? await apiHandler.lookupValueHandler.update(id, payload)
          : await apiHandler.lookupValueHandler.create(payload);

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

      const { data } = await apiHandler.lookupValueHandler.get(ID);
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
      reset({ name: data?.name, category_id: data?.category_id });
    }
  }, [data, reset]);

  const handleSetValue = useCallback(
    (key: any, value: any) => {
      setValue(key, value?._id);
    },
    [setValue],
  );

  return (
    <div>
      <PageBreadcrumb
        pageTitle={`${
          action === 'edit' ? 'Edit' : action === 'view' ? 'View' : 'Create'
        } Category Value`}
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
          <div className="space-y-6">
            <form onSubmit={handleSubmit(handleSave)}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-2 sm:col-span-1 relative">
                  <Label
                    htmlFor="category_id"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Category
                  </Label>
                  <Controller
                    name="category_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        isDisabled={action === 'view'}
                        endPoints={apiHandler.lookupCategoryHandler.lookup}
                        filterStr={`value=`}
                        placeholder="Select Category"
                        value={field.value}
                        objKey="category_id"
                        func={handleSetValue}
                        display="name"
                      />
                    )}
                  />
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.category_id.message}
                    </p>
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1 relative">
                  <Label
                    htmlFor="parent_category_id"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Parent Category
                  </Label>
                  <Controller
                    name="parent_category_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        isDisabled={action === 'view'}
                        endPoints={apiHandler.lookupValueHandler.get}
                        filterStr={`parent-sub-category/${watch(
                          'category_id',
                        )}`}
                        placeholder="Select Parent Category"
                        value={field.value}
                        objKey="parent_category_id"
                        func={handleSetValue}
                        display="name"
                      />
                    )}
                  />
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.category_id.message}
                    </p>
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label
                    htmlFor="fullName"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Value Name
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      id="name"
                      placeholder="Enter Category Value Name"
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                      type="text"
                      {...register('name')}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                {action !== 'view' && (
                  <div className="col-span-2 flex justify-end">
                    <AnimatedButton type="submit" variant="primary" size="md">
                      {action === 'edit'
                        ? 'Update Category Value'
                        : 'Create Category Value'}
                    </AnimatedButton>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryValueCreate;
