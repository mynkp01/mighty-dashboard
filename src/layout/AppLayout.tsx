import { Outlet } from 'react-router';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import Backdrop from './Backdrop';

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 w-full transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? 'lg:pl-[290px]' : 'lg:pl-[80px]'
        } ${isMobileOpen ? 'pl-0' : ''}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-screen-2xl md:py-6">
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
