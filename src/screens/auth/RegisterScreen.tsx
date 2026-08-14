import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KHH_COLORS, RADIUS, SPACING, TYPE } from '@/theme/colors';
import { PrimaryButton } from '@/components/PrimaryButton';
import { verifyPatientByHn } from '@/services/api';
import type { AuthStackParamList } from '@/navigation/RootNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

// Security note: the hospital number (HN) or citizen ID (CID) entered here
// is sent straight to the backend lookup endpoint and is NEVER logged or
// persisted client-side in plain text. This deliberately avoids the LINE
// chat exposure risk noted in the project's security review — there is no
// "chat history" for this value to sit in.
export function RegisterScreen({ route, navigation }: Props) {
  const { role } = route.params;
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { patient, pdpaPinRequired } = await verifyPatientByHn(query.trim());
      if (pdpaPinRequired) {
        navigation.navigate('PdpaPin', { hn: patient.hn, name: patient.name });
      } else {
        navigation.replace('PdpaPin', { hn: patient.hn, name: patient.name });
      }
    } catch (e) {
      Alert.alert(
        'ไม่พบข้อมูล',
        'ไม่พบข้อมูลผู้ป่วยในระบบ กรุณาตรวจสอบเลขบัตรประชาชนหรือ HN อีกครั้ง หรือติดต่อเจ้าหน้าที่'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {role === 'patient' ? 'ลงทะเบียนผู้ป่วย' : 'ลงทะเบียนเจ้าหน้าที่'}
      </Text>
      <Text style={styles.subtitle}>
        กรอกเลขบัตรประชาชน (13 หลัก) หรือหมายเลข HN ของท่าน
      </Text>

      <TextInput
        style={styles.input}
        placeholder="เลขบัตรประชาชน หรือ HN"
        keyboardType="number-pad"
        value={query}
        onChangeText={setQuery}
        maxLength={13}
      />

      {loading ? (
        <ActivityIndicator color={KHH_COLORS.PRIMARY_TEAL} style={{ marginTop: SPACING.lg }} />
      ) : (
        <PrimaryButton label="ค้นหาข้อมูล" onPress={onSubmit} disabled={!query.trim()} />
      )}

      <Text style={styles.hint}>
        หรือสแกนบาร์โค้ดจากบัตรนัดของโรงพยาบาล (HOSxP) เพื่อกรอกอัตโนมัติ
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KHH_COLORS.BACKGROUND, padding: SPACING.xl },
  title: { ...TYPE.h1, color: KHH_COLORS.TEXT_PRIMARY, marginTop: SPACING.xl },
  subtitle: { ...TYPE.body, color: KHH_COLORS.TEXT_SECONDARY, marginTop: SPACING.sm, marginBottom: SPACING.xl },
  input: {
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
    backgroundColor: KHH_COLORS.SURFACE,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: SPACING.lg,
  },
  hint: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, marginTop: SPACING.xl, textAlign: 'center' },
});
