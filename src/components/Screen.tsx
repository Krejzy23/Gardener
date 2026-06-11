import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LeafPatternBackground } from './LeafPatternBackground';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  contentClassName?: string;
};

export function Screen({
  children,
  scroll = true,
  contentClassName = 'gap-6 px-5 pt-5 pb-28',
}: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-stone-50" edges={['top']}>
      <LeafPatternBackground />
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className={contentClassName}>{children}</View>
        </ScrollView>
      ) : (
        <View className={contentClassName}>{children}</View>
      )}
    </SafeAreaView>
  );
}
