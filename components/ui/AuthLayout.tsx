import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { AppButton } from './AppButton';
import { InfoCard } from './InfoCard';

import { colors, radius, spacing, typography } from '@/styles';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  submitLabel: string;
  onSubmit: () => void;
  submitLoading?: boolean;
  submitDisabled?: boolean;
  linkLabel: string;
  onLinkPress: () => void;
  errorMessage?: string | null;
  heroMessage?: string;
  illustration?: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  submitLabel,
  onSubmit,
  submitLoading = false,
  submitDisabled = false,
  linkLabel,
  onLinkPress,
  errorMessage,
  heroMessage = 'Senang bertemu kembali!',
  illustration,
}: AuthLayoutProps) {
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroSection}>
          <View style={styles.illustrationContainer}>
            {illustration ?? <Text style={styles.illustrationEmoji}>🌸</Text>}
          </View>
          {heroMessage ? <Text style={styles.heroMessage}>{heroMessage}</Text> : null}
        </View>

        <InfoCard
          variant="pastel"
          title={title}
          titleStyle={styles.cardTitle}
          contentContainerStyle={styles.cardContent}
        >
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.formContainer}>{children}</View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <AppButton
            label={submitLabel}
            onPress={onSubmit}
            loading={submitLoading}
            disabled={submitDisabled}
            variant="pastel"
          />
        </InfoCard>

        <Pressable style={styles.linkButton} onPress={onLinkPress}>
          <Text style={styles.linkText}>{linkLabel}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxxxl,
    gap: spacing.xxl,
  } as ViewStyle,
  heroSection: {
    alignItems: 'center',
    gap: spacing.md,
  } as ViewStyle,
  illustrationContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.secondaryPastel,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  } as ViewStyle,
  illustrationEmoji: {
    fontSize: 38,
  } as TextStyle,
  heroMessage: {
    textAlign: 'center',
    color: colors.textMuted,
    ...typography.subtitle,
  } as TextStyle,
  cardTitle: {
    textAlign: 'center',
  } as TextStyle,
  cardContent: {
    paddingTop: spacing.sm,
  } as ViewStyle,
  subtitle: {
    textAlign: 'center',
    color: colors.textMuted,
    ...typography.body,
  } as TextStyle,
  formContainer: {
    width: '100%',
    gap: spacing.lg,
  } as ViewStyle,
  errorText: {
    textAlign: 'center',
    color: colors.danger,
    ...typography.caption,
  } as TextStyle,
  linkButton: {
    alignItems: 'center',
  } as ViewStyle,
  linkText: {
    color: colors.pastelLink,
    ...typography.caption,
    fontWeight: '600',
  } as TextStyle,
});
