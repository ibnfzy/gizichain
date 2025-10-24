import { forwardRef } from 'react';
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

interface AppTextInputProps extends TextInputProps {
  errorMessage?: string;
  containerStyle?: StyleProp<ViewStyle>;
  errorTextStyle?: StyleProp<TextStyle>;
}

export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  ({ errorMessage, style, containerStyle, errorTextStyle, ...props }, ref) => (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        {...props}
      />
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, errorTextStyle]}>{errorMessage}</Text>
        </View>
      ) : null}
    </View>
  ),
);

AppTextInput.displayName = 'AppTextInput';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  errorContainer: {
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
  },
});
