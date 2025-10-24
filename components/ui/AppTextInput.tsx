import { forwardRef } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface AppTextInputProps extends TextInputProps {
  errorMessage?: string;
}

export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  ({ errorMessage, className = '', ...props }, ref) => {
    const baseClassName =
      'w-full rounded-2xl border border-brand-pink/40 bg-white/90 px-4 py-3 text-base text-gray-900 shadow-sm focus:border-brand-green focus:outline-none';

    return (
      <View className="w-full">
        <TextInput
          ref={ref}
          placeholderTextColor="#9CA3AF"
          className={`${baseClassName} ${className}`.trim()}
          {...props}
        />
        {errorMessage ? (
          <View className="mt-1">
            <Text className="text-xs text-rose-500">{errorMessage}</Text>
          </View>
        ) : null}
      </View>
    );
  },
);

AppTextInput.displayName = 'AppTextInput';
