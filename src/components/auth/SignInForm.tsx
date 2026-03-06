import { yupResolver } from '@hookform/resolvers/yup';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import * as yup from 'yup';
import { apiHandler } from '../../api/apiHandler';
import { EyeCloseIcon, EyeIcon } from '../../icons';
import { useAppDispatch } from '../../redux/hooks';
import { setIsLoading } from '../../redux/slices/loadingSlice';
import { setUser } from '../../redux/slices/userSlice';
import { showToast } from '../../utils/helper';
import Label from '../form/Label';
import Checkbox from '../form/input/Checkbox';
import Input from '../form/input/InputField';
import Button from '../ui/button/Button';

type FormValues = {
  email: string;
  password: string;
};

export default function SignInForm() {
  const validationSchema = yup.object().shape({
    email: yup.string().trim().required('Email / Phone Number is required'),
    password: yup.string().trim().required('Password is required'),
  });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(validationSchema) });

  const handleLogin = async (user: FormValues) => {
    try {
      dispatch(setIsLoading(true));
      const { data, status } = await apiHandler.authHandler.signIn(user);
      if (status === 200 || status === 201) {
        const userData = data?.data?.data;
        const token = data?.data?.token;

        dispatch(setUser(userData));
        Cookies.set('token', token);

        navigate('/dashboard');
        showToast('success', data?.message);
      }
    } catch (error: any) {
      showToast('error', error?.message || 'Login failed');
      console.error('Login error:', error);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1">
      <form onSubmit={handleSubmit(handleLogin)}>
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Sign In
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter your email and password to sign in!
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>
                  Email / Phone Number
                  <span className="text-error-500"> *</span>
                </Label>
                <Input placeholder="info@gmail.com" {...register('email')} />
                {errors.email && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="login-checkbox"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <label
                    htmlFor="login-checkbox"
                    className="block font-normal select-none text-gray-700 text-theme-sm dark:text-gray-400"
                  >
                    Keep me logged in
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400"
                >
                  Forgot password?
                </Link>
              </div>

              <div>
                <Button
                  className="w-full"
                  size="sm"
                  disabled={isSubmitting}
                  name={isSubmitting ? 'Signing in...' : 'Sign in'}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
