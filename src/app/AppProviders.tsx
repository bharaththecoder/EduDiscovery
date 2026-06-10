import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { CounselorProvider } from '@/contexts/CounselorContext';
import { PWAProvider } from '@/contexts/PWAContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <PWAProvider>
        <WishlistProvider>
          <ToastProvider>
            <CounselorProvider>{children}</CounselorProvider>
          </ToastProvider>
        </WishlistProvider>
      </PWAProvider>
    </AuthProvider>
  );
}
