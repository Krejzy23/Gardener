import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';

import FruitingIllustration from 'assets/svg/fruiting.svg';
import HerbsIllustration from 'assets/svg/herbs.svg';
import OrnamentalIllustration from 'assets/svg/ornamental.svg';
import OtherIllustration from 'assets/svg/other.svg';
import SucculentIllustration from 'assets/svg/succulents.svg';
import VegetableIllustration from 'assets/svg/vegetable.svg';
import type { PlantCategory } from '@/types/plants';

type PlantCategoryVisual = {
  accent: string;
  background: string;
  border: string;
  chip: string;
  Illustration: ComponentType<SvgProps>;
  imageSize: number;
};

export const plantCategoryVisuals: Record<PlantCategory, PlantCategoryVisual> = {
  ornamental: {
    accent: 'bg-red-400',
    background: 'bg-red-200',
    border: 'border-red-200',
    chip: 'bg-red-50 text-red-800',
    Illustration: OrnamentalIllustration,
    imageSize: 112,
  },
  fruiting: {
    accent: 'bg-orange-400',
    background: 'bg-orange-200',
    border: 'border-orange-200',
    chip: 'bg-orange-50 text-orange-800',
    Illustration: FruitingIllustration,
    imageSize: 112,
  },
  herb: {
    accent: 'bg-lime-400',
    background: 'bg-lime-200',
    border: 'border-lime-200',
    chip: 'bg-lime-50 text-lime-800',
    Illustration: HerbsIllustration,
    imageSize: 112,
  },
  vegetable: {
    accent: 'bg-green-500',
    background: 'bg-green-200',
    border: 'border-green-200',
    chip: 'bg-green-50 text-green-800',
    Illustration: VegetableIllustration,
    imageSize: 112,
  },
  succulent: {
    accent: 'bg-teal-400',
    background: 'bg-teal-200',
    border: 'border-teal-200',
    chip: 'bg-teal-50 text-teal-800',
    Illustration: SucculentIllustration,
    imageSize: 112,
  },
  other: {
    accent: 'bg-stone-400',
    background: 'bg-stone-200',
    border: 'border-stone-200',
    chip: 'bg-stone-50 text-stone-800',
    Illustration: OtherIllustration,
    imageSize: 112,
  },
};

export function getPlantCategoryVisual(category: PlantCategory): PlantCategoryVisual {
  return plantCategoryVisuals[category];
}
