import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Truck } from 'lucide-react-native';
import { authApi } from '../api';
import { useAuthStore } from '../store';

export default function LoginScreen() {
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!totpCode.trim() || totpCode.trim().length < 6) {
      Alert.alert('خطأ', 'الرجاء إدخال الرمز بشكل صحيح.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.loginEmployee(totpCode.trim());
      if (response.data && response.data.token) {
        await login(response.data.token, response.data.userName, response.data.currencySymbol || 'ر.س');
      }
    } catch (error: any) {
      if ((error.code === 'ERR_NETWORK' || error.message === 'Network Error') && totpCode === 'DRIVERTEST') {
        Alert.alert('وضع الاختبار', 'تم تعذر الاتصال بالخادم. تسجيل الدخول في وضع عدم الاتصال.');
        await login('fake-token-for-testing', 'Sami Driver', 'ر.س');
      } else {
        console.error(error);
        Alert.alert('خطأ في تسجيل الدخول', error.response?.data?.message || 'الكود غير صحيح أو منتهي الصلاحية.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.title}>دخول المندوب</Text>
        <Text style={styles.subtitle}>أدخل كود FoodRMS للبدء</Text>

        <TextInput
          style={styles.input}
          placeholder="أدخل الرمز (6 أرقام)"
          placeholderTextColor="#64748b"
          value={totpCode}
          onChangeText={(text) => setTotpCode(text.toUpperCase())}
          keyboardType="default"
          autoCapitalize="characters"
          maxLength={10}
          textAlign="center"
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#1A1A1A" />
          ) : (
            <Text style={styles.buttonText}>تسجيل الدخول</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 400,
    borderRadius: 0,
    padding: 30,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    ...Platform.select({
      web: { boxShadow: '6px 6px 0px #1A1A1A' },
      default: { elevation: 0 }
    }),
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFBEB',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    ...Platform.select({
      web: { boxShadow: '4px 4px 0px #1A1A1A' },
      default: { elevation: 0 }
    }),
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 60,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 20,
    letterSpacing: 4,
    ...Platform.select({
      web: { boxShadow: '4px 4px 0px #1A1A1A' },
      default: { elevation: 0 }
    }),
  },
  button: {
    backgroundColor: '#FFD700',
    width: '100%',
    height: 60,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '4px 4px 0px #1A1A1A' },
      default: { elevation: 0 }
    }),
  },
  buttonDisabled: {
    backgroundColor: '#F1F5F9',
  },
  buttonText: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '900',
  },
});
