import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import {
  StyleProp,
  ViewStyle,
  type ImageStyle,
  type TextStyle,
} from 'react-native';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle | TextStyle | ImageStyle>;
  weight?: SymbolWeight;
}) {
  const iconStyle = style as StyleProp<ViewStyle>;

  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        iconStyle,
      ]}
    />
  );
}
