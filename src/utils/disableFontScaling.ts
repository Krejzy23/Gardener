import { Text, TextInput } from "react-native";

type FontScalingDefaults = {
  defaultProps?: {
    allowFontScaling?: boolean;
    maxFontSizeMultiplier?: number;
    [key: string]: unknown;
  };
};

function disableComponentFontScaling(component: FontScalingDefaults) {
  component.defaultProps = {
    ...component.defaultProps,
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
  };
}

disableComponentFontScaling(Text as unknown as FontScalingDefaults);
disableComponentFontScaling(TextInput as unknown as FontScalingDefaults);
