import { ReactNode, memo } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import colors from '@/styles/colors';
import radius from '@/styles/radius';

interface InfoCardProps extends ViewProps {
  title: string;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

const InfoCardComponent = ({
  title,
  children,
  style,
  contentContainerStyle,
  titleStyle,
  ...viewProps
}: InfoCardProps) => (
  <View style={[styles.container, style]} {...viewProps}>
    <Text style={[styles.title, titleStyle]}>{title}</Text>
    <View style={[styles.content, contentContainerStyle]}>{children}</View>
  </View>
);

export const InfoCard = memo(InfoCardComponent);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  content: {
    width: '100%',
  },
});
