import { CheckCircle2, Clock3, Droplets, HeartPulse, Leaf, MapPin } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { CalendarCareItem } from '@/types/plants';
import { useI18n } from '@/i18n/I18nProvider';
import { typography } from '@/styles/typography';
import { formatDueDistance } from '@/utils/date';
import { getPlantHealthVisual } from '@/utils/plantHealth';
import { getPlantCategoryVisual } from '@/utils/plantVisuals';

type CalendarCareItemCardProps = {
  item: CalendarCareItem;
  notificationTimeLabel: string;
  onComplete: (taskId: string) => void;
};

const taskMeta = {
  watering: {
    action: 'bg-sky-700 active:bg-sky-800',
    detail: 'border-sky-100 bg-sky-50',
    icon: Droplets,
    iconColor: '#0369a1',
    background: 'bg-sky-100',
    chip: 'bg-sky-100 text-sky-800',
  },
  fertilizing: {
    action: 'bg-amber-700 active:bg-amber-800',
    detail: 'border-amber-100 bg-amber-50',
    icon: Leaf,
    iconColor: '#a16207',
    background: 'bg-amber-100',
    chip: 'bg-amber-100 text-amber-800',
  },
};

const statusTone = {
  overdue: {
    accent: 'bg-rose-500',
    chip: 'border-rose-100 bg-rose-50 text-rose-700',
    card: 'border-rose-100',
  },
  due_today: {
    accent: 'bg-emerald-500',
    chip: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    card: 'border-emerald-100',
  },
  upcoming: {
    accent: 'bg-amber-400',
    chip: 'border-amber-100 bg-amber-50 text-amber-700',
    card: 'border-stone-100',
  },
  disabled: {
    accent: 'bg-stone-300',
    chip: 'border-stone-100 bg-stone-50 text-stone-400',
    card: 'border-stone-100',
  },
};

export function CalendarCareItemCard({ item, notificationTimeLabel, onComplete }: CalendarCareItemCardProps) {
  const { language, t } = useI18n();
  const Icon = taskMeta[item.type].icon;
  const tone = taskMeta[item.type];
  const status = statusTone[item.status];
  const plant = item.task.plant;
  const categoryVisual = getPlantCategoryVisual(plant.category);
  const healthVisual = getPlantHealthVisual(plant.health);
  const CategoryIllustration = categoryVisual.Illustration;
  const canComplete = item.status === 'due_today' || item.status === 'overdue';
  const careDetail = item.type === 'watering' ? plant.waterType : plant.fertilizerType;
  const careDetailLabel = item.type === 'watering' ? t('plantCard.water') : t('plantCard.fertilizer');

  return (
    <View className={`overflow-hidden rounded-lg border shadow-sm shadow-stone-200 ${categoryVisual.background} ${categoryVisual.border}`}>
      <View className={`h-1.5 ${categoryVisual.accent}`} />
      <View className="gap-4 p-4">
        <View className="flex-row items-start gap-4">
          <View className="min-w-0 flex-1 pt-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className={`rounded-md px-2 py-1 ${typography.chip} ${categoryVisual.chip}`}>
                {t(`plant.category.${plant.category}`)}
              </Text>
              <Text className={`rounded-md px-2 py-1 ${typography.chip} ${tone.chip}`}>{t(`care.task.${item.type}`)}</Text>
              <Text className={`rounded-md border px-2 py-1 ${typography.chip} ${status.chip}`}>
                {item.isProjected ? t('common.planned') : t(`care.status.${item.status}`)} · {formatDueDistance(item.date, language)}
              </Text>
            </View>

            <Text className={`mt-2 ${typography.cardTitleLarge} text-stone-950`} numberOfLines={2}>{plant.name}</Text>
            <View className="mt-2 flex-row items-center gap-2">
              <View className={`h-8 w-8 items-center justify-center rounded-lg ${tone.background}`}>
                <Icon color={tone.iconColor} size={18} strokeWidth={2.3} />
              </View>
              <Text className={`min-w-0 flex-1 ${typography.body} text-stone-700`}>
                {t(`care.task.${item.type}Action`)} {t("interval.everyManyDays", { count: item.task.intervalDays }).toLowerCase()}
                {notificationTimeLabel === t('common.off') ? '' : ` · ${notificationTimeLabel}`}
              </Text>
            </View>
          </View>

          <View className="h-24 w-24 shrink-0 items-center justify-center overflow-hidden">
            <CategoryIllustration width={96} height={96} />
          </View>
        </View>

        <View className="gap-2 rounded-lg border border-white/60 bg-white/60 p-3">
          <Text className={`${typography.label} text-stone-500`}>{t('calendar.profile')}</Text>
          <Text className={`${typography.bodyStrong} text-stone-700`}>
            {t(`plant.environment.${plant.environment}`)}
          </Text>
          <View className="flex-row items-center gap-2">
            <MapPin color="#78716c" size={15} strokeWidth={2.3} />
            <Text className={`${typography.body} text-stone-600`}>{t(`plant.light.${plant.light}`)}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <HeartPulse color={healthVisual.iconColor} size={15} strokeWidth={2.3} />
            <Text className={`${typography.body} text-stone-600`}>{t(`plant.health.${plant.health}`)}</Text>
          </View>
          {plant.notes ? <Text className={`${typography.body} text-stone-600`}>{plant.notes}</Text> : null}
        </View>

        {careDetail ? (
          <View className={`rounded-lg border px-3 py-3 ${tone.detail}`}>
            <Text className={`${typography.label} text-stone-500`}>{careDetailLabel}</Text>
            <Text className={`mt-1 ${typography.bodyStrong} text-stone-800`}>{careDetail}</Text>
          </View>
        ) : null}

        {canComplete ? (
          <Pressable
            className={`flex-row items-center justify-center gap-2 rounded-lg px-4 py-3 ${tone.action}`}
            onPress={() => onComplete(item.task.id)}
          >
            <CheckCircle2 color="#ffffff" size={19} strokeWidth={2.4} />
            <Text className={`${typography.bodyStrong} text-white`}>{t(`care.task.${item.type}Action`)} {t('care.doneSuffix')}</Text>
          </Pressable>
        ) : (
          <View className="flex-row items-center gap-2 rounded-lg border border-white/60 bg-white/60 px-3 py-2">
            <Clock3 color="#78716c" size={17} strokeWidth={2.3} />
            <Text className={`${typography.bodyStrong} text-stone-600`}>{t('common.planned')}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
