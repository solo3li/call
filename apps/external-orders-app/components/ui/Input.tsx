import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Theme } from '../../constants/Theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({ label, error, containerStyle, style, ...props }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, style, error && styles.inputError]}
        placeholderTextColor="#888"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.sm,
  },
  label: {
    fontFamily: Theme.typography.fontFamilyBold,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Theme.colors.surface,
    borderWidth: Theme.components.borderWidth,
    borderColor: Theme.colors.border,
    borderRadius: Theme.components.borderRadius,
    padding: Theme.spacing.md,
    fontFamily: Theme.typography.fontFamily,
    fontSize: 16,
    color: Theme.colors.text,
    // Subtle inner shadow effect could be added, but flat is good for brutish
  },
  inputError: {
    borderColor: Theme.colors.danger,
  },
  errorText: {
    fontFamily: Theme.typography.fontFamily,
    fontSize: 12,
    color: Theme.colors.danger,
    marginTop: 4,
  }
});
