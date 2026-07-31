import { Suspense } from 'react';
import LoginApp from '../../components/LoginApp';

export const metadata = {
  title: 'SHOPIMAMI | Staff Login',
  description: 'Secure staff portal login.',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginApp />
    </Suspense>
  );
}
