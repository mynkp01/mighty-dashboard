import { useEffect } from 'react';
import { apiHandler } from '../api/apiHandler';
import PageBreadcrumb from '../components/common/PageBreadCrumb';
import PasswordCard from '../components/UserProfile/PasswordCard';
import UserInfoCard from '../components/UserProfile/UserInfoCard';
import UserMetaCard from '../components/UserProfile/UserMetaCard';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setIsLoading } from '../redux/slices/loadingSlice';
import { setUser } from '../redux/slices/userSlice';
import { showToast } from '../utils/helper';

export default function UserProfiles() {
  const dispatch = useAppDispatch();
  const userData: any = useAppSelector((state) => state.user);

  const handleFetchUser = async () => {
    try {
      dispatch(setIsLoading(true));
      const { data } = await apiHandler.authHandler.viewProfile();
      dispatch(setUser(data?.data));
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    handleFetchUser();
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <UserMetaCard userData={userData} />
          <UserInfoCard userData={userData} handleFetchUser={handleFetchUser} />
          <PasswordCard />
        </div>
      </div>
    </>
  );
}
