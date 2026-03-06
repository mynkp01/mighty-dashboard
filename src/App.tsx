import AOS from 'aos';
import 'aos/dist/aos.css';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router';
import { ScrollToTop } from './components/common/ScrollToTop';
import { useSocket } from './hooks/useSocket';
import AppLayout from './layout/AppLayout';
import ProtectedRoute from './layout/ProtectedRoute';
import ForgotPassword from './pages/AuthPages/ForgotPassword';
import ResetPassword from './pages/AuthPages/ResetPassword';
import SignIn from './pages/AuthPages/SignIn';
import NotFound from './pages/OtherPage/NotFound';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { setUser } from './redux/slices/userSlice';
import { routes } from './Routes';
import { ROLE, ROUTES } from './utils/Constant';
import { isEmpty } from './utils/helper';
const token = Cookies.get('token') || '';

export default function App() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const { socket, isConnected } = useSocket();
  const dispatch = useAppDispatch();

  const userData: any = useAppSelector((state) => state.user);

  useEffect(() => {
    if (
      (isEmpty(userData) || isEmpty(token)) &&
      !ROUTES.publicPaths.includes(window?.location?.pathname)
    ) {
      window.location.href = '/sign-in';
    } else {
      if (
        !isEmpty(userData) &&
        !isEmpty(token) &&
        ROUTES.publicPaths.includes(window?.location?.pathname)
      ) {
        window.location.href = '/dashboard';
      }
    }
  }, [userData]);

  // Socket handling
  useEffect(() => {
    if (!socket || !isConnected || !userData?._id) return;

    socket.emit('ROOM', { id: userData._id.toLowerCase() });

    socket.on('MODULE', (value) => {
      if (value) {
        dispatch(
          setUser({
            ...userData,
            module: !isEmpty(value) ? value : null,
          }),
        );
      }
    });

    return () => {
      socket.off('MODULE');
    };
  }, [isConnected, socket, dispatch]);

  return (
    <Router>
      <ScrollToTop />

      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<AppLayout />}>
          {routes?.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute
                  allowedRoles={route.allowedRoles}
                  requiredModule={route.requiredModule}
                >
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}
          <Route
            path="/"
            element={
              <ProtectedRoute
                allowedRoles={[ROLE.ADMIN, ROLE.EMPLOYEE, ROLE.BDE, ROLE.HR]}
              >
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
