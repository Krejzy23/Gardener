import type { NavigatorScreenParams } from '@react-navigation/native';

export type DiaryStackParamList = {
  DiaryHome: undefined;
  PlantDetail: {
    plantId: string;
  };
};

export type RootTabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  Diary: NavigatorScreenParams<DiaryStackParamList> | undefined;
  Settings: undefined;
};
