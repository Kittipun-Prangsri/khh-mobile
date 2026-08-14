import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { KHH_COLORS, RADIUS, SPACING, TYPE } from '@/theme/colors';
import { confirmAppointment, getMyAppointments, requestReschedule } from '@/services/api';
import type { Appointment } from '@/types';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppointmentsStackParamList } from '@/navigation/MainTabs';

type Props = NativeStackScreenProps<AppointmentsStackParamList, 'AppointmentDetail'>;

// Note: unlike the LINE Flex "family share" card, this screen intentionally
// does NOT expose the raw check-in code as shareable text — it renders as a
// QR image only, per the security review's guidance to strip identifying
// numbers from anything that leaves the authenticated app context.
export function AppointmentDetailScreen({ route }: Props) {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    getMyAppointments().then((list: Appointment[]) => {
      setAppointment(list.find((a: Appointment) => a.id === appointmentId) ?? null);
    });
  }, [appointmentId]);

  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text style={styles.body}>กำลังโหลดข้อมูลนัดหมาย...</Text>
      </View>
    );
  }

  const onConfirm = async () => {
    try {
      const updated = await confirmAppointment(appointment.id);
      setAppointment(updated);
      Alert.alert('สำเร็จ', 'ยืนยันนัดหมายเรียบร้อยแล้ว');
    } catch {
      Alert.alert('ผิดพลาด', 'ไม่สามารถยืนยันนัดหมายได้ กรุณาลองใหม่');
    }
  };

  const onReschedule = () => {
    Alert.prompt?.(
      'ขอเลื่อนนัด',
      'กรุณาระบุเหตุผลโดยย่อ',
      async (reason) => {
        try {
          const updated = await requestReschedule(appointment.id, reason ?? '');
          setAppointment(updated);
          Alert.alert('ส่งคำขอแล้ว', 'เจ้าหน้าที่จะติดต่อกลับเพื่อยืนยันวันใหม่');
        } catch {
          Alert.alert('ผิดพลาด', 'ไม่สามารถส่งคำขอเลื่อนนัดได้');
        }
      }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.lg }}>
      <View style={styles.card}>
        <Text style={styles.date}>{appointment.date}</Text>
        <Text style={styles.body}>{appointment.clinic}</Text>
        <Text style={styles.meta}>{appointment.time}</Text>
        {appointment.doctor ? <Text style={styles.meta}>แพทย์: {appointment.doctor}</Text> : null}
      </View>

      <View style={styles.qrPlaceholder}>
        <Text style={styles.qrLabel}>QR สำหรับเช็กอินด้วยตนเอง</Text>
        <View style={styles.qrBox}>
          <QRCode
            value={appointment.checkinCode}
            size={164}
            color={KHH_COLORS.TEXT_PRIMARY}
            backgroundColor={KHH_COLORS.SURFACE}
          />
        </View>
        <Text style={styles.qrHint}>แสดง QR นี้ที่จุดเช็กอินของโรงพยาบาล</Text>
      </View>

      <PrimaryButton label="ยืนยันนัดหมาย" onPress={onConfirm} />
      <View style={{ height: SPACING.md }} />
      <PrimaryButton label="ขอเลื่อนนัด" onPress={onReschedule} color={KHH_COLORS.WARNING_AMBER} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KHH_COLORS.BACKGROUND },
  card: {
    backgroundColor: KHH_COLORS.SURFACE,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  date: { ...TYPE.h1, color: KHH_COLORS.PRIMARY_TEAL },
  body: { ...TYPE.body, color: KHH_COLORS.TEXT_PRIMARY, marginTop: SPACING.xs },
  meta: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, marginTop: 2 },
  qrPlaceholder: { alignItems: 'center', marginBottom: SPACING.xl },
  qrLabel: { ...TYPE.body, color: KHH_COLORS.TEXT_PRIMARY, marginBottom: SPACING.md },
  qrBox: {
    width: 180,
    height: 180,
    backgroundColor: KHH_COLORS.BORDER,
    borderRadius: RADIUS.md,
  },
  qrHint: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, marginTop: SPACING.sm },
});
