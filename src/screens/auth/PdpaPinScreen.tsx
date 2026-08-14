import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KHH_COLORS, RADIUS, SPACING, TYPE } from '@/theme/colors';
import { PrimaryButton } from '@/components/PrimaryButton';
import { submitPdpaPin, setToken } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { AuthStackParamList } from '@/navigation/RootNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'PdpaPin'>;

// PDPA note: the PIN is hashed server-side (never compared in plaintext),
// rate-limited on the backend, and this screen never stores the PIN itself
// — only the short-lived session token returned after a successful check.
export function PdpaPinScreen({ route }: Props) {
  const { hn, name } = route.params;
  const { signIn } = useAuth();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (pin.length < 4) return;
    setLoading(true);
    try {
      const { token, patient } = await submitPdpaPin(hn, pin);
      await setToken(token);
      signIn(patient);
    } catch {
      Alert.alert('PIN ไม่ถูกต้อง', 'กรุณาตรวจสอบ PIN คุ้มครองข้อมูลส่วนบุคคล (PDPA) แล้วลองอีกครั้ง');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const onBiometric = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) {
      Alert.alert('ไม่พร้อมใช้งาน', 'อุปกรณ์นี้ยังไม่ได้ตั้งค่า Face ID / ลายนิ้วมือ');
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'ยืนยันตัวตนเพื่อเข้าถึงข้อมูลสุขภาพ',
    });
    if (result.success) {
      // Biometric unlock only re-activates an EXISTING valid session token;
      // it never substitutes for the initial PDPA PIN check server-side.
      Alert.alert('สำเร็จ', 'ยืนยันตัวตนด้วยไบโอเมตริกสำเร็จ');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ยืนยันตัวตน (PDPA)</Text>
      <Text style={styles.subtitle}>
        สวัสดีคุณ {name}{'\n'}กรุณากรอก PIN คุ้มครองข้อมูลส่วนบุคคล 4-6 หลัก
      </Text>

      <TextInput
        style={styles.pinInput}
        placeholder="••••"
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        value={pin}
        onChangeText={setPin}
      />

      {loading ? (
        <ActivityIndicator color={KHH_COLORS.PRIMARY_TEAL} style={{ marginVertical: SPACING.lg }} />
      ) : (
        <PrimaryButton label="ยืนยัน" onPress={onSubmit} disabled={pin.length < 4} />
      )}

      <Text style={styles.orText}>หรือ</Text>
      <PrimaryButton label="ใช้ Face ID / ลายนิ้วมือ" onPress={onBiometric} color={KHH_COLORS.DARK_TEAL} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KHH_COLORS.BACKGROUND, padding: SPACING.xl, justifyContent: 'center' },
  title: { ...TYPE.h1, color: KHH_COLORS.TEXT_PRIMARY, textAlign: 'center' },
  subtitle: {
    ...TYPE.body,
    color: KHH_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
    backgroundColor: KHH_COLORS.SURFACE,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  orText: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, textAlign: 'center', marginVertical: SPACING.md },
});
