import { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface InfoCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function InfoCard({ title, children, className = '' }: InfoCardProps) {
  const baseClassName = 'w-full rounded-2xl bg-white/95 p-5 shadow-sm shadow-brand-pink/10';

  return (
    <View className={`${baseClassName} ${className}`.trim()}>
      <Text className="mb-3 text-lg font-semibold text-gray-900">{title}</Text>
      {children}
    </View>
  );
}
