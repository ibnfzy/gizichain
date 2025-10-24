import { memo } from 'react';
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

export type AppButtonVariant = 'primary' | 'secondary';

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
  const variantStyle = variant === 'secondary' ? styles.secondary : styles.primary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabledState}
      style={[styles.container, variantStyle, disabledState && styles.disabled, style]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors.textInverted} />
      ) : (
        <Text style={[styles.label, textStyle]}>{label}</Text>
      )}
    </Pressable>
  );
};

export const AppButton = memo(AppButtonComponent);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
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
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    color: colors.textInverted,
    fontSize: 16,
    fontWeight: '700',
  },
});
