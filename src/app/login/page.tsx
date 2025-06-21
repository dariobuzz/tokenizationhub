import LoginPage  from '@/components/LoginPage'; // Changed from default to named import
import Layout from '../../components/Layout';

export default function Login() {
  return (
    <Layout hideSidebar={true}>
      <LoginPage />
    </Layout>
  );
}