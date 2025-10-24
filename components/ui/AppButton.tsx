import { ActivityIndicator, Pressable, PressableProps, Text } from 'react-native';

interface AppButtonProps extends PressableProps {
  label: string;
  loading?: boolean;
}

export function AppButton({ label, loading = false, className = '', disabled, ...props }: AppButtonProps) {
  const baseClassName =
    'w-full rounded-2xl bg-brand-green px-4 py-3 text-center shadow-lg shadow-brand-green/20';
  const disabledState = disabled || loading;
  const disabledClassName = disabledState ? ' opacity-60' : '';

  return (
    <Pressable
      className={`${baseClassName}${disabledClassName} ${className}`.trim()}
      disabled={disabledState}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="text-base font-bold text-white">{label}</Text>
      )}
    </Pressable>
  );
}
