import DashboardLayout from '@/components/dashboard/dashboard-layout';
import PrivateWrapper from '@/components/privateWrapper/PrivateWrapper';

const Layout = ({ children }) => {
  return (
    <PrivateWrapper requiredRole="shop_owner">
      <DashboardLayout>
        {children}
      </DashboardLayout>
     </PrivateWrapper>
  );
};
export default Layout;