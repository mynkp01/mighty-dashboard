import { yupResolver } from '@hookform/resolvers/yup';
import { EyeIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import * as yup from 'yup';
import { apiHandler } from '../../api/apiHandler';
import { EyeCloseIcon } from '../../icons';
import { useAppDispatch } from '../../redux/hooks';
import { setIsLoading } from '../../redux/slices/loadingSlice';
import { showToast } from '../../utils/helper';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import Button from '../ui/button/Button';

type FormValues = {
  password: string;
  confirm_password: string;
};

const validationSchema = yup.object().shape({
  password: yup.string().trim().required('Password is required'),
  confirm_password: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
  });

  const handleSave = async (formData: FormValues) => {
    if (!token) {
      showToast('error', 'Invalid or missing token.');
      return;
    }

    try {
      dispatch(setIsLoading(true));
      const { data } = await apiHandler.authHandler.resetPassword({
        password: formData.password,
        token,
      });
      showToast('success', data?.message || 'Password reset successfully.');
      navigate('/sign-in');
    } catch (error: any) {
      showToast('error', error?.response?.data?.message || error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Reset Your Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please enter your new password to reset your account access.
            </p>
          </div>

          <form onSubmit={handleSubmit(handleSave)}>
            <div className="space-y-6">
              {/* Password Field */}
              <div>
                <Label>
                  New Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword1 ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                  />
                  <span
                    onClick={() => setShowPassword1(!showPassword1)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword1 ? (
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

              {/* Confirm Password Field */}
              <div>
                <Label>
                  Confirm Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword2 ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    {...register('confirm_password')}
                  />
                  <span
                    onClick={() => setShowPassword2(!showPassword2)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword2 ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  className="w-full"
                  size="sm"
                  name="Reset Password"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
