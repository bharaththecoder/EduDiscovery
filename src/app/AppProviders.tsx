import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { CounselorProvider } from '@/contexts/CounselorContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <ToastProvider>
          <CounselorProvider>{children}</CounselorProvider>
        </ToastProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
