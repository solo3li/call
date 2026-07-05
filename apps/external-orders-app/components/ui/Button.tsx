import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Theme } from '../../constants/Theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  style, 
  textStyle,
  disabled 
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary': return Theme.colors.primary;
      case 'secondary': return Theme.colors.secondary;
      case 'success': return Theme.colors.success;
      case 'warning': return Theme.colors.warning;
      case 'danger': return Theme.colors.danger;
      default: return Theme.colors.primary;
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button, 
        { backgroundColor: getBackgroundColor() },
        disabled && styles.disabled,
        style
      ]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderWidth: Theme.components.borderWidth,
    borderColor: Theme.colors.border,
    borderRadius: Theme.components.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    // Hard drop shadow
    shadowColor: Theme.colors.border,
    shadowOffset: Theme.components.shadowOffset,
    shadowOpacity: Theme.components.shadowOpacity,
    shadowRadius: Theme.components.shadowRadius,
    elevation: 5,
    marginVertical: Theme.spacing.sm,
  },
  text: {
    color: Theme.colors.surface,
    fontFamily: Theme.typography.fontFamilyBold,
    fontSize: 18,
    textTransform: 'uppercase',
  },
  disabled: {
    opacity: 0.5,
  }
});
