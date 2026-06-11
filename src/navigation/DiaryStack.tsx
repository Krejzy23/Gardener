import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DiaryPage } from '@/pages/DiaryPage';
import { PlantDetailPage } from '@/pages/PlantDetailPage';
import type { DiaryStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<DiaryStackParamList>();

export function DiaryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiaryHome" component={DiaryPage} />
      <Stack.Screen name="PlantDetail" component={PlantDetailPage} />
    </Stack.Navigator>
  );
}
