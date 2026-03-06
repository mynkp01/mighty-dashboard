import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import * as yup from 'yup';
import { apiHandler } from '../../api/apiHandler';
import { useAppDispatch } from '../../redux/hooks';
import { setIsLoading } from '../../redux/slices/loadingSlice';
import { showToast } from '../../utils/helper';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import Button from '../ui/button/Button';

type FormValues = { email: string };

const ForgotPasswordForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .trim()
      .required('Email is required')
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Invalid email format',
      ),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: { email: '' },
  });

  const handleSave = async (formData: FormValues) => {
    try {
      dispatch(setIsLoading(true));
      const { data, status } = await apiHandler.authHandler.forgotPassword(
        formData,
      );

      if (status === 200 || status === 201) {
        showToast('success', data?.message);
        navigate('/sign-in');
      }
    } catch (error: any) {
      showToast(
        'error',
        error?.response?.data?.message ||
          error?.message ||
          'Something went wrong',
      );
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit(handleSave)}>
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Forgot Your Password?
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter the email address linked to your account, and we'll send
                you a link to reset your password.
              </p>
            </div>
            <div>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input placeholder="info@gmail.com" {...register('email')} />
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    name="Send Reset Link"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="flex items-center py-4">
                <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                  Wait, I remember my password...
                </span>
                <Link
                  to="/sign-in"
                  className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400"
                >
                  Click here
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
