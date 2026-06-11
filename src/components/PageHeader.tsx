import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { typography } from '@/styles/typography';

type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
};

export function PageHeader({ title, eyebrow, action }: PageHeaderProps) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <View className="flex-1">
        {eyebrow ? <Text className={`${typography.label} text-emerald-700`}>{eyebrow}</Text> : null}
        <Text className={`mt-1 ${typography.pageTitle} text-stone-950`}>{title}</Text>
      </View>
      {action}
    </View>
  );
}
