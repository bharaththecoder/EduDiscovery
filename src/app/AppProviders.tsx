import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { CounselorProvider } from '@/contexts/CounselorContext';
import { PWAProvider } from '@/contexts/PWAContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UniversityProvider } from '@/contexts/UniversityContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PWAProvider>
          <WishlistProvider>
            <ToastProvider>
              <UniversityProvider>
                <CounselorProvider>{children}</CounselorProvider>
              </UniversityProvider>
            </ToastProvider>
          </WishlistProvider>
        </PWAProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
