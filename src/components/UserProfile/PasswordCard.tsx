import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { apiHandler } from '../../api/apiHandler';
import { useAppDispatch } from '../../redux/hooks';
import { setIsLoading } from '../../redux/slices/loadingSlice';
import { showToast } from '../../utils/helper';
import PasswordInput from '../common/Password';
import AnimatedButton from '../ui/AnimatedButton';

export default function PasswordCard() {
  const dispatch = useAppDispatch();

  const validationSchema = yup.object().shape({
    old_password: yup.string().trim().required('Old Password is required'),
    new_password: yup.string().trim().required('New Password is required'),
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(validationSchema) });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSave = async (payload: any) => {
    try {
      dispatch(setIsLoading(true));
      const { data } = await apiHandler.authHandler.changePassword(payload);
      showToast('success', data?.message);
      reset(); // Clear the form on successful submission
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ">
      <div className="p-4 sm:p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
          Change Password
        </h4>
        <div className="space-y-6">
          <form onSubmit={handleSubmit(handleSave)}>
            <div className="grid md:w-1/3 gap-4">
              <PasswordInput
                id="old_password"
                label="Old Password"
                placeholder="Enter Old Password"
                register={register}
                error={errors.old_password}
                showPassword={showOldPassword}
                toggleShowPassword={() => setShowOldPassword(!showOldPassword)}
              />
              <PasswordInput
                id="new_password"
                label="New Password"
                placeholder="Enter New Password"
                register={register}
                error={errors.new_password}
                showPassword={showNewPassword}
                toggleShowPassword={() => setShowNewPassword(!showNewPassword)}
              />
              <div className="flex justify-end">
                <AnimatedButton variant="primary" type="submit" size="md">
                  Save
                </AnimatedButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
