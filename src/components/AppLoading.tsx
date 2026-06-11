import { ActivityIndicator, Text, View } from 'react-native';

import { useI18n } from '@/i18n/I18nProvider';
import { typography } from '@/styles/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Leaf } from 'lucide-react-native';

import { LeafPatternBackground } from './LeafPatternBackground';

export function AppLoading() {
  const { t } = useI18n();

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <LeafPatternBackground />
      <View className="flex-1 items-center justify-center gap-4">
        <View className="h-14 w-14 items-center justify-center rounded-lg bg-emerald-700 shadow-sm shadow-emerald-200">
          <Leaf color="#ffffff" size={30} strokeWidth={2.4} />
        </View>
        <ActivityIndicator color="#047857" />
        <Text className={`${typography.bodyStrong} text-stone-600`}>{t('app.loading')}</Text>
      </View>
    </SafeAreaView>
  );
}
