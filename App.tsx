import { StatusBar } from 'expo-status-bar';

import './global.css';
import { AppLoading } from '@/components/AppLoading';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { CareNotificationsProvider } from '@/hooks/useCareNotifications';
import { I18nProvider } from '@/i18n/I18nProvider';
import { PlantCareProvider } from '@/hooks/usePlantCareData';
import { BottomTabs } from '@/navigation/BottomTabs';
import { AuthPage } from '@/pages/AuthPage';
import { configureCareNotificationHandler } from '@/services/careNotificationService';

configureCareNotificationHandler();

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppContent />
      </AuthProvider>
    </I18nProvider>
  );
}

function AppContent() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <AppLoading />;
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <PlantCareProvider ownerId={user.uid}>
      <CareNotificationsProvider ownerId={user.uid}>
        <BottomTabs />
      </CareNotificationsProvider>
    </PlantCareProvider>
  );
}
