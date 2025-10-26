import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import colors from '@/styles/colors';
import radius from '@/styles/radius';

export interface AppSelectOption {
  label: string;
  value: string;
}

interface AppSelectProps {
  placeholder?: string;
  value?: string;
  options: AppSelectOption[];
  onValueChange?: (value: string) => void;
  errorMessage?: string;
  containerStyle?: StyleProp<ViewStyle>;
  errorTextStyle?: StyleProp<TextStyle>;
}

export function AppSelect({
  placeholder,
  value,
  options,
  onValueChange,
  errorMessage,
  containerStyle,
  errorTextStyle,
}: AppSelectProps) {
  const [visible, setVisible] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const hasError = Boolean(errorMessage);

  const handleSelect = (selectedValue: string) => {
    onValueChange?.(selectedValue);
    setVisible(false);
  };

  const handleOpen = () => {
    if (options.length === 0) {
      return;
    }

    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable
        onPress={handleOpen}
        style={[styles.input, hasError ? styles.inputError : undefined]}
      >
        <Text
          style={[
            styles.valueText,
            !selectedOption ? styles.placeholderText : undefined,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder ?? 'Pilih opsi'}
        </Text>
      </Pressable>
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, errorTextStyle]}>{errorMessage}</Text>
        </View>
      ) : null}

      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
          <View style={styles.modalCard}>
            {placeholder ? (
              <Text style={styles.modalTitle}>{placeholder}</Text>
            ) : null}
            <ScrollView style={styles.optionList}>
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    style={[
                      styles.option,
                      isSelected ? styles.optionSelected : undefined,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected ? styles.optionLabelSelected : undefined,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
    paddingVertical: 12,
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  } as ViewStyle,
  inputError: {
    borderColor: colors.danger,
  } as ViewStyle,
  valueText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  } as TextStyle,
  placeholderText: {
    color: colors.textMuted,
  } as TextStyle,
  errorContainer: {
    marginTop: 4,
  } as ViewStyle,
  errorText: {
    fontSize: 12,
    color: colors.danger,
  } as TextStyle,
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  } as ViewStyle,
  modalCard: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: radius.xl,
    backgroundColor: colors.background,
    paddingVertical: 16,
    paddingHorizontal: 20,
  } as ViewStyle,
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.textPrimary,
  } as TextStyle,
  optionList: {
    maxHeight: 320,
  } as ViewStyle,
  option: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  } as ViewStyle,
  optionSelected: {
    backgroundColor: colors.primaryPastel,
  } as ViewStyle,
  optionLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  } as TextStyle,
  optionLabelSelected: {
    fontWeight: '600',
    color: colors.primary,
  } as TextStyle,
});
