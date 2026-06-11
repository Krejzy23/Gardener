import { Text, View } from 'react-native';
import { typography } from '@/styles/typography';

type MetricCardProps = {
  label: string;
  value: string | number;
  tone?: 'green' | 'amber' | 'red';
};

const toneClasses = {
  green: {
    card: 'border-emerald-100 bg-white',
    value: 'text-emerald-700',
    accent: 'bg-emerald-500',
  },
  amber: {
    card: 'border-amber-100 bg-white',
    value: 'text-amber-700',
    accent: 'bg-amber-500',
  },
  red: {
    card: 'border-rose-100 bg-white',
    value: 'text-rose-700',
    accent: 'bg-rose-500',
  },
};

export function MetricCard({ label, value, tone = 'green' }: MetricCardProps) {
  const toneClassName = toneClasses[tone];

  return (
    <View
      className={`min-w-0 flex-1 overflow-hidden rounded-lg border px-4 py-2 ${toneClassName.card}`}
    >
      <View className={`mb-3 h-1 w-12 rounded-full ${toneClassName.accent}`} />
      <Text
        className={`${typography.metric} ${toneClassName.value}`}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {value}
      </Text>
      <Text
        className={`mt-1 ${typography.label} text-stone-500`}
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
}
