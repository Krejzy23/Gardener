import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { CalendarDays } from 'lucide-react-native';
import { Platform, Pressable, Text, View } from 'react-native';
import { useState } from 'react';

import { useI18n } from '@/i18n/I18nProvider';
import { languageLocales } from '@/i18n/translations';
import { toDateInputValue } from '@/utils/date';
import { typography } from '@/styles/typography';

type DatePickerFieldProps = {
  label: string;
  onChange: (value: string) => void;
  value: string;
};

function parseDateValue(value: string): Date {
  const parsedDate = new Date(`${value}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date();
  }

  return parsedDate;
}

export function DatePickerField({ label, onChange, value }: DatePickerFieldProps) {
  const { language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = parseDateValue(value);
  const locale = languageLocales[language];
  const displayDateFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  function handleChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS !== 'ios') {
      setIsOpen(false);
    }

    if (event.type === 'dismissed' || !date) {
      return;
    }

    onChange(toDateInputValue(date));
  }

  return (
    <View className="flex-1 gap-2">
      <Text className={`${typography.caption} text-stone-600`}>{label}</Text>
      {Platform.OS === 'ios' ? (
        <View className="min-h-12 justify-center rounded-lg border border-stone-200 bg-white px-2 py-1">
          <DateTimePicker locale={locale} mode="date" onChange={handleChange} value={selectedDate} display="compact" />
        </View>
      ) : (
        <>
          <Pressable
            className="min-h-12 flex-row items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white px-3 py-3 active:bg-stone-50"
            onPress={() => setIsOpen(true)}
          >
            <Text className={`min-w-0 flex-1 ${typography.input} text-stone-950`}>{displayDateFormatter.format(selectedDate)}</Text>
            <CalendarDays color="#57534e" size={18} strokeWidth={2.3} />
          </Pressable>
          {isOpen ? <DateTimePicker mode="date" onChange={handleChange} value={selectedDate} display="default" /> : null}
        </>
      )}
    </View>
  );
}
