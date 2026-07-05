import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '../../constants/Theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderWidth: Theme.components.borderWidth,
    borderColor: Theme.colors.border,
    borderRadius: Theme.components.borderRadius,
    padding: Theme.spacing.md,
    marginVertical: Theme.spacing.sm,
    // Hard drop shadow
    shadowColor: Theme.colors.border,
    shadowOffset: Theme.components.shadowOffset,
    shadowOpacity: Theme.components.shadowOpacity,
    shadowRadius: Theme.components.shadowRadius,
    elevation: 3,
  }
});
