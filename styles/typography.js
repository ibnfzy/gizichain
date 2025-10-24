import { Platform } from 'react-native';

const fontFamilies = Platform.select({
  ios: {
    regular: 'system-ui',
    medium: 'system-ui',
    bold: 'system-ui',
    mono: 'ui-monospace',
  },
  android: {
    regular: 'sans-serif',
    medium: 'sans-serif-medium',
    bold: 'sans-serif',
    mono: 'monospace',
  },
  default: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'monospace',
  },
});

const typography = {
  fontFamilies,
  heading1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    fontFamily: fontFamilies?.bold,
  },
  heading2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    fontFamily: fontFamilies?.medium,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    fontFamily: fontFamilies?.medium,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: fontFamilies?.regular,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: fontFamilies?.regular,
  },
  overline: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: fontFamilies?.medium,
  },
};

export default typography;
