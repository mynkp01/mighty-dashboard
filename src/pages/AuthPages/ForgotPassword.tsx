import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import AuthLayout from './AuthPageLayout';

export default function ForgotPassword() {
  return (
    <>
      <AuthLayout>
        <ForgotPasswordForm />
      </AuthLayout>
    </>
  );
}
