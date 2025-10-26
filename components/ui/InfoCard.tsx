import { ReactNode, memo } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import colors from '@/styles/colors';
import radius from '@/styles/radius';
import spacing from '@/styles/spacing';
import typography from '@/styles/typography';

export type InfoCardVariant = 'flat' | 'elevated' | 'info' | 'nutrient' | 'pastel';

interface InfoCardProps extends ViewProps {
  title: string;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  variant?: InfoCardVariant;
}

const InfoCardComponent = ({
  title,
  children,
  style,
  contentContainerStyle,
  titleStyle,
  variant = 'elevated',
  ...viewProps
}: InfoCardProps) => {
  const variantStyle = INFO_CARD_VARIANTS[variant];

  return (
    <View style={[styles.container, variantStyle.container, style]} {...viewProps}>
      <Text style={[styles.title, variantStyle.title, titleStyle]}>{title}</Text>
      <View style={[styles.content, variantStyle.content, contentContainerStyle]}>{children}</View>
    </View>
  );
};

export const InfoCard = memo(InfoCardComponent);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radius.lg,
    padding: 20,
  } as ViewStyle,
  title: {
    marginBottom: 12,
    color: colors.textPrimary,
    ...typography.subtitle,
  } as TextStyle,
  content: {
    width: '100%',
  } as ViewStyle,
});

const INFO_CARD_VARIANTS: Record<
  InfoCardVariant,
  {
    container: ViewStyle;
    title?: TextStyle;
    content?: ViewStyle;
  }
> = {
  flat: {
    container: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.primaryPastel,
      shadowOpacity: 0,
      elevation: 0,
    } as ViewStyle,
  },
  elevated: {
    container: {
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    } as ViewStyle,
  },
  info: {
    container: {
      backgroundColor: colors.skyPastel,
      borderLeftWidth: 4,
      borderColor: colors.primary,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    } as ViewStyle,
    title: {
      color: colors.primary,
    } as TextStyle,
    content: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: colors.primaryPastel,
      paddingTop: 12,
    } as ViewStyle,
  },
  nutrient: {
    container: {
      backgroundColor: colors.lavenderPastel,
      borderWidth: 1,
      borderColor: colors.outlineMuted,
      paddingVertical: 18,
      paddingHorizontal: 20,
      shadowOpacity: 0,
      elevation: 0,
    } as ViewStyle,
    title: {
      color: colors.textMuted,
      ...(typography.subtitle as TextStyle),
      fontSize: 16,
      fontWeight: '600',
    } as TextStyle,
    content: {
      marginTop: 10,
    } as ViewStyle,
  },
  pastel: {
    container: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.primaryPastel,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
      paddingVertical: 24,
      paddingHorizontal: 24,
    } as ViewStyle,
    title: {
      color: colors.pastelTitle,
      ...(typography.heading2 as TextStyle),
    } as TextStyle,
    content: {
      marginTop: 12,
      gap: spacing.lg,
    } as ViewStyle,
  },
};
