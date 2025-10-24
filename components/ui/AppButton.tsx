import { memo, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';

import colors from '@/styles/colors';
import radius from '@/styles/radius';

export type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

interface AppButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  loading?: boolean;
  variant?: AppButtonVariant;
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}

const AppButtonComponent = ({
  label,
  loading = false,
  disabled,
  variant = 'primary',
  style,
  textStyle,
  ...props
}: AppButtonProps) => {
  const disabledState = disabled || loading;

  const variantStyles = useMemo<{
    container: StyleProp<ViewStyle>;
    label: StyleProp<TextStyle>;
    indicatorColor?: string;
    rippleColor: string;
  }>(() => {
    const base = VARIANT_MAP[variant];
    const disabledVariant = DISABLED_VARIANT_MAP[variant];

    if (disabledState) {
      return {
        container: [base.container, disabledVariant?.container],
        label: [base.label, disabledVariant?.label],
        indicatorColor: disabledVariant?.indicatorColor ?? base.indicatorColor,
        rippleColor: disabledVariant?.rippleColor ?? base.rippleColor,
      };
    }

    return base;
  }, [disabledState, variant]);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabledState}
      android_ripple={{ color: variantStyles.rippleColor, borderless: false }}
      style={({ pressed }) => [
        styles.container,
        variantStyles.container,
        pressed && !disabledState ? styles.pressed : null,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.indicatorColor ?? colors.card} />
      ) : (
        <Text style={[styles.label, variantStyles.label, textStyle]}>{label}</Text>
      )}
    </Pressable>
  );
};

export const AppButton = memo(AppButtonComponent);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pressed: {
    opacity: 0.92,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});

const VARIANT_MAP: Record<
  AppButtonVariant,
  {
    container: ViewStyle;
    label: TextStyle;
    indicatorColor?: string;
    rippleColor: string;
  }
> = {
  primary: {
    container: {
      backgroundColor: colors.primary,
    },
    label: {
      color: colors.textInverted,
    },
    indicatorColor: colors.textInverted,
    rippleColor: colors.primaryTint,
  },
  secondary: {
    container: {
      backgroundColor: colors.secondary,
    },
    label: {
      color: colors.textPrimary,
    },
    indicatorColor: colors.textPrimary,
    rippleColor: colors.secondaryTint,
  },
  danger: {
    container: {
      backgroundColor: colors.danger,
    },
    label: {
      color: colors.textInverted,
    },
    indicatorColor: colors.textInverted,
    rippleColor: colors.dangerTint,
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    label: {
      color: colors.primary,
    },
    indicatorColor: colors.primary,
    rippleColor: colors.primaryTint,
  },
};

const DISABLED_VARIANT_MAP: Partial<
  Record<
    AppButtonVariant,
    {
      container?: ViewStyle;
      label?: TextStyle;
      indicatorColor?: string;
      rippleColor?: string;
    }
  >
> = {
  primary: {
    container: {
      backgroundColor: colors.primaryPastel,
    },
    label: {
      color: colors.textMuted,
    },
    indicatorColor: colors.textMuted,
    rippleColor: colors.primaryPastel,
  },
  secondary: {
    container: {
      backgroundColor: colors.secondaryPastel,
    },
    label: {
      color: colors.textMuted,
    },
    indicatorColor: colors.textMuted,
    rippleColor: colors.secondaryPastel,
  },
  danger: {
    container: {
      backgroundColor: colors.dangerPastel,
    },
    label: {
      color: colors.textMuted,
    },
    indicatorColor: colors.textMuted,
    rippleColor: colors.dangerPastel,
  },
  outline: {
    container: {
      borderColor: colors.outlineMuted,
      backgroundColor: 'transparent',
    },
    label: {
      color: colors.outlineMuted,
    },
    indicatorColor: colors.outlineMuted,
    rippleColor: colors.outlineMuted,
  },
};
