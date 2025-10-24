import { StyleSheet } from 'react-native';
import colors from './colors';
import radius from './radius';
import spacing from './spacing';
import typography from './typography';

const globalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  cardPastel: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cardElevated: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCenter: {
    textAlign: 'center',
  },
  textMuted: {
    color: colors.textMuted,
  },
  shadow: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  heading: {
    ...typography.heading2,
    color: colors.textPrimary,
  },
  bodyText: {
    ...typography.body,
    color: colors.textPrimary,
  },
});

export default globalStyles;
