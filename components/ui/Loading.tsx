import { memo } from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import colors from '@/styles/colors';

export type LoadingSize = 'small' | 'medium' | 'large';

interface LoadingProps {
  size?: LoadingSize;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const LoadingComponent = ({ size = 'large', color = colors.primary, style }: LoadingProps) => {
  const indicatorSize = size === 'small' ? 20 : size === 'medium' ? 28 : 36;

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={indicatorSize} color={color} />
    </View>
  );
};

export const Loading = memo(LoadingComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
