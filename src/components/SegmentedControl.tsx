import { Pressable, Text, View } from 'react-native';

import { typography } from '@/styles/typography';

export type SegmentedOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ label, options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View className="gap-2">
      <Text className={`${typography.fieldLabel} text-stone-800`}>{label}</Text>
      <View className="flex-row flex-wrap gap-2 rounded-lg bg-stone-100 p-1">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              key={option.value}
              className={`rounded-lg px-3 py-2 active:bg-emerald-100 ${
                isSelected ? 'bg-emerald-700' : 'bg-transparent'
              }`}
              onPress={() => onChange(option.value)}
            >
              <Text className={`${typography.bodyStrong} ${isSelected ? 'text-white' : 'text-stone-700'}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
