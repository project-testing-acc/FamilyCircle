// Login Screen - Authentication
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useAlert } from '@/template';
import { useFamily } from '@/hooks/useFamily';
import { Button, Input } from '@/components/ui';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { sendOTP, verifyOTPAndLogin, signInWithPassword, operationLoading } = useAuth();
  const { showAlert } = useAlert();
  const { currentFamily, loading: familyLoading } = useFamily();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      showAlert('Please enter your email');
      return;
    }

    const { error } = await sendOTP(email);
    if (error) {
      showAlert(error);
      return;
    }

    setOtpSent(true);
    showAlert('Verification code sent to your email');
  };

  const handleRegister = async () => {
    if (!email || !password || !otp) {
      showAlert('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showAlert('Password must be at least 6 characters');
      return;
    }

    const { error } = await verifyOTPAndLogin(email, otp, { password });
    if (error) {
      showAlert(error);
      return;
    }

    // Show success alert and navigate on OK
    showAlert('Success', 'Account created successfully!', [
      {
        text: 'OK',
        onPress: () => {
          // Wait a bit for family data to load, then navigate
          setTimeout(() => {
            if (!familyLoading) {
              router.replace(currentFamily ? '/(tabs)' : '/family/setup');
            }
          }, 500);
        },
      },
    ]);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Please enter email and password');
      return;
    }

    const { error } = await signInWithPassword(email, password);
    if (error) {
      showAlert(error);
      return;
    }

    // Show success alert and navigate on OK
    showAlert('Success', 'Login successful!', [
      {
        text: 'OK',
        onPress: () => {
          // Wait a bit for family data to load, then navigate
          setTimeout(() => {
            if (!familyLoading) {
              router.replace(currentFamily ? '/(tabs)' : '/family/setup');
            }
          }, 500);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <MaterialIcons name="people" size={64} color={colors.primary} />
          <Text style={styles.title}>FamilyCircle</Text>
          <Text style={styles.subtitle}>Your private family space</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tab, mode === 'login' && styles.activeTab]}
              onPress={() => {
                setMode('login');
                setOtpSent(false);
                setOtp('');
              }}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>
                Login
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, mode === 'register' && styles.activeTab]}
              onPress={() => {
                setMode('register');
                setOtpSent(false);
                setOtp('');
              }}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>
                Register
              </Text>
            </Pressable>
          </View>

          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!operationLoading}
          />

          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!operationLoading}
          />

          {mode === 'register' && (
            <>
              <Input
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!operationLoading}
              />

              {!otpSent ? (
                <Button
                  title="Send Verification Code"
                  onPress={handleSendOTP}
                  disabled={operationLoading}
                />
              ) : (
                <>
                  <Input
                    placeholder="Enter 4-digit code"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={4}
                    editable={!operationLoading}
                  />
                  <Pressable onPress={handleSendOTP} disabled={operationLoading}>
                    <Text style={styles.resendText}>Resend code</Text>
                  </Pressable>
                </>
              )}
            </>
          )}

          {mode === 'login' ? (
            <Button
              title={operationLoading ? 'Logging in...' : 'Login'}
              onPress={handleLogin}
              disabled={operationLoading}
            />
          ) : (
            otpSent && (
              <Button
                title={operationLoading ? 'Creating account...' : 'Create Account'}
                onPress={handleRegister}
                disabled={operationLoading}
              />
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.surface,
  },
  resendText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    textAlign: 'center',
    marginTop: -spacing.sm,
  },
});
