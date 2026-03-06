import ResetPasswordForm from '../../components/auth/ResetPasswordForm';
import AuthLayout from './AuthPageLayout';

export default function ResetPassword() {
  return (
    <>
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}
