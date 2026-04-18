import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/services/firebase';
import { logEvent } from 'firebase/analytics';

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_path: location.pathname,
        page_search: location.search,
      });
      // Optionally save to our own db if we wanted persistent custom tracking here,
      // but Firebase Analytics natively supports this!
    }
  }, [location]);

  return null;
}
