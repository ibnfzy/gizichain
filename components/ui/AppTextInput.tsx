import { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import colors from '@/styles/colors';
import radius from '@/styles/radius';

interface AppTextInputProps extends TextInputProps {
  errorMessage?: string;
  containerStyle?: StyleProp<ViewStyle>;
  errorTextStyle?: StyleProp<TextStyle>;
}

export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  ({ errorMessage, style, containerStyle, errorTextStyle, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const hasError = Boolean(errorMessage);

    const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>(
      (event) => {
        setIsFocused(true);
        onFocus?.(event);
      },
      [onFocus],
    );

    const handleBlur = useCallback<NonNullable<TextInputProps['onBlur']>>(
      (event) => {
        setIsFocused(false);
        onBlur?.(event);
      },
      [onBlur],
    );

    const dynamicInputStyle = useMemo(() => {
      const borderColor = hasError
        ? colors.danger
        : isFocused
          ? colors.primary
          : colors.border;

      return [{ borderColor }, style];
    }, [hasError, isFocused, style]);

    return (
      <View style={[styles.container, containerStyle]}>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, ...dynamicInputStyle]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, errorTextStyle]}>{errorMessage}</Text>
          </View>
        ) : null}
      </View>
    );
  },
);

AppTextInput.displayName = 'AppTextInput';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  } as ViewStyle,
  input: {
    width: '100%',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  } as TextStyle,
  errorContainer: {
    marginTop: 4,
  } as ViewStyle,
  errorText: {
    fontSize: 12,
    color: colors.danger,
  } as TextStyle,
});
