import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '../redux/hooks';
import { isEmpty } from '../utils/helper';
interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectPath?: string;
  children?: React.ReactNode;
  requiredModule?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectPath = '/404',
  children,
  requiredModule,
}) => {
  const userData: any = useAppSelector((state) => state?.user);

  // ✅ Redirect if not authenticated
  if (isEmpty(userData)) {
    return <Navigate to="/sign-in" replace />;
  }

  // ✅ Redirect if role not allowed
  if (allowedRoles && !allowedRoles.includes(userData?.user_type)) {
    return <Navigate to={redirectPath} replace />;
  }

  if (requiredModule) {
    const hasModuleAccess = userData.module?.some(
      (module: any) => module?.name === requiredModule,
    );

    if (!hasModuleAccess) {
      return <Navigate to="/404" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
