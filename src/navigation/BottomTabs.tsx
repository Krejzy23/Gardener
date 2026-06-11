import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CalendarDays, LayoutDashboard, Settings, Sprout } from 'lucide-react-native';
import { enableScreens } from 'react-native-screens';

import { CalendarPage } from '@/pages/CalendarPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { useI18n } from '@/i18n/I18nProvider';
import { DiaryStack } from '@/navigation/DiaryStack';
import { SettingsPage } from '@/pages/SettingsPage';
import type { RootTabParamList } from '@/types/navigation';

enableScreens();

const Tab = createBottomTabNavigator<RootTabParamList>();

const tabIcons = {
  Dashboard: LayoutDashboard,
  Calendar: CalendarDays,
  Diary: Sprout,
  Settings,
};

export function BottomTabs() {
  const { t } = useI18n();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => {
          const Icon = tabIcons[route.name];

          return {
            headerShown: false,
            tabBarActiveTintColor: '#065f46',
            tabBarInactiveTintColor: '#8a8179',
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '700',
            },
            tabBarStyle: {
              height: 112,
              paddingTop: 9,
              paddingBottom: 12,
              borderTopWidth: 1,
              borderTopColor: '#e8e4dc',
              backgroundColor: '#fffcf7',
            },
            tabBarIcon: ({ color, size }) => <Icon color={color} size={size} strokeWidth={2.3} />,
          };
        }}
      >
        <Tab.Screen name="Dashboard" component={DashboardPage} options={{ title: t('nav.dashboard') }} />
        <Tab.Screen name="Calendar" component={CalendarPage} options={{ title: t('nav.calendar') }} />
        <Tab.Screen name="Diary" component={DiaryStack} options={{ title: t('nav.diary') }} />
        <Tab.Screen name="Settings" component={SettingsPage} options={{ title: t('nav.settings') }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
