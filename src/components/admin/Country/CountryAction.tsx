import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import * as yup from 'yup';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { showToast } from '../../../utils/helper';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import AnimatedButton from '../../ui/AnimatedButton';

function CountryAction() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any>(null);

  const action = searchParams.get('action');
  const id: any = searchParams.get('id');

  const validationSchema = yup.object().shape({
    name: yup.string().trim().required('Country Name is required'),
    country_code: yup.string(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(validationSchema) });

  const handleSave = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));

      const { data } =
        action === 'edit'
          ? await apiHandler.countryHandler.update(id, payload)
          : await apiHandler.countryHandler.create(payload);
      navigate(-1);
      showToast('success', data?.message);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleFetchCountry = async (ID: string) => {
    try {
      dispatch(setIsLoading(true));

      const { data } = await apiHandler.countryHandler.get(ID);
      setData(data?.data);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    if (id) {
      handleFetchCountry(id);
    }
  }, [id, action]);

  useEffect(() => {
    if (data) {
      reset({
        country_code: data?.country_code,
        name: data?.name,
      });
    }
  }, [data, reset]);

  const watchName = watch('name');
  useEffect(() => {
    if (watchName) {
      setValue(
        'country_code',
        watchName.trim().toUpperCase().replace(/\s+/g, '_'),
      );
    }
  }, [watchName, setValue]);

  return (
    <div>
      <PageBreadcrumb
        pageTitle={`${
          action === 'edit' ? 'Edit' : action === 'view' ? 'View' : 'Create'
        } Country`}
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
                <div className="col-span-2 sm:col-span-1">
                  <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Country Name
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      id="name"
                      placeholder="Enter Country Name"
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
                    <AnimatedButton variant="primary" size="md">
                      Save
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

export default CountryAction;
