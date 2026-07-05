import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Theme } from '../../constants/Theme';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';

export default function LoginScreen() {
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!totpCode || totpCode.length < 10) {
      setError('يرجى إدخال كود الموظف المكون من 10 رموز');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/Auth/login-employee', {
        totpCode
      });

      if (response.data && response.data.token) {
        await login(response.data.token);
      } else {
        setError('خطأ في الاستجابة من الخادم');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل تسجيل الدخول. تأكد من اتصالك بالإنترنت والبيانات المدخلة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>تسجيل الدخول</Text>
        <Text style={styles.subtitle}>تطبيق أوامر التوصيل الخارجية</Text>
        
        <View style={styles.form}>
          <Input 
            label="كود الموظف (TOTP)"
            placeholder="أدخل الكود"
            value={totpCode}
            onChangeText={setTotpCode}
            autoCapitalize="characters"
          />
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          {loading ? (
            <ActivityIndicator size="large" color={Theme.colors.primary} style={styles.loader} />
          ) : (
            <Button 
              title="تسجيل الدخول" 
              onPress={handleLogin} 
              style={styles.loginBtn}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    padding: Theme.spacing.lg,
  },
  content: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderWidth: Theme.components.borderWidth,
    borderColor: Theme.colors.border,
    // Neo-brutalist shadow for the whole form card
    shadowColor: Theme.colors.border,
    shadowOffset: Theme.components.shadowOffset,
    shadowOpacity: Theme.components.shadowOpacity,
    shadowRadius: Theme.components.shadowRadius,
    elevation: 5,
  },
  title: {
    fontFamily: Theme.typography.fontFamilyBlack,
    fontSize: 32,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily,
    fontSize: 16,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  form: {
    gap: Theme.spacing.sm,
  },
  errorText: {
    color: Theme.colors.danger,
    fontFamily: Theme.typography.fontFamilyBold,
    textAlign: 'center',
    marginVertical: Theme.spacing.sm,
  },
  loader: {
    marginVertical: Theme.spacing.lg,
  },
  loginBtn: {
    marginTop: Theme.spacing.md,
  }
});
