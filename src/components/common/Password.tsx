import { EyeIcon } from 'lucide-react';
import { EyeCloseIcon } from '../../icons';
import Input from '../form/input/InputField';
import Label from '../form/Label';

export default function PasswordInput({
  id,
  label,
  placeholder,
  register,
  error,
  showPassword,
  toggleShowPassword,
}: any) {
  return (
    <div>
      <Label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
          {...register(id)}
        />
        <span
          onClick={toggleShowPassword}
          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
        >
          {showPassword ? (
            <EyeIcon className="stroke-gray-500 size-4.5" />
          ) : (
            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
          )}
        </span>
        {/* <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-3 top-1/2 dark:text-gray-400">
          <LockKeyhole className="size-4.5" />
        </span> */}
      </div>
      {error && <p className="mt-1 text-sm text-error-500">{error.message}</p>}
    </div>
  );
}
