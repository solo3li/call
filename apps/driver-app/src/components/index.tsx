import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Impeccable standard enforces a refined, precise aesthetic

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary' }) => {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity 
      style={[styles.button, isPrimary ? styles.primary : styles.secondary]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textSecondary]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    // Minimalist, smooth elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primary: {
    backgroundColor: '#0F172A', // Slate 900
  },
  secondary: {
    backgroundColor: '#F8FAFC', // Slate 50
    borderWidth: 1,
    borderColor: '#E2E8F0', // Slate 200
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: '#0F172A',
  }
});
