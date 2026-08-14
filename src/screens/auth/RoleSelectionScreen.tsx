import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KHH_COLORS, RADIUS, SPACING, TYPE } from '@/theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/RootNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelection'>;

export function RoleSelectionScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>KHH Safe-Connect</Text>
      <Text style={styles.subtitle}>โรงพยาบาลคลองหาด · ระบบดูแลผู้ป่วยโรคไม่ติดต่อเรื้อรัง (NCDs)</Text>

      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('Register', { role: 'patient' })}
      >
        <Ionicons name="person-outline" size={28} color={KHH_COLORS.PRIMARY_TEAL} />
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.cardTitle}>ฉันเป็นผู้ป่วย</Text>
          <Text style={styles.cardSubtitle}>ดูนัดหมาย ผลแล็บ และคำแนะนำสุขภาพ</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={KHH_COLORS.TEXT_SECONDARY} />
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('Register', { role: 'staff' })}
      >
        <Ionicons name="medkit-outline" size={28} color={KHH_COLORS.DARK_TEAL} />
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.cardTitle}>ฉันเป็นเจ้าหน้าที่</Text>
          <Text style={styles.cardSubtitle}>เข้าสู่ระบบสำหรับบุคลากรโรงพยาบาล</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={KHH_COLORS.TEXT_SECONDARY} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KHH_COLORS.BACKGROUND, padding: SPACING.xl, justifyContent: 'center' },
  title: { ...TYPE.h1, color: KHH_COLORS.PRIMARY_TEAL, textAlign: 'center' },
  subtitle: {
    ...TYPE.body,
    color: KHH_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KHH_COLORS.SURFACE,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardTitle: { ...TYPE.h2, color: KHH_COLORS.TEXT_PRIMARY },
  cardSubtitle: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, marginTop: 2 },
});
