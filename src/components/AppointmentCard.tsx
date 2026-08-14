import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KHH_COLORS, RADIUS, SPACING, TYPE } from '@/theme/colors';
import type { Appointment } from '@/types';

const STATUS_TH: Record<Appointment['status'], string> = {
  upcoming: 'กำลังจะถึง',
  confirmed: 'ยืนยันแล้ว',
  completed: 'เสร็จสิ้น',
  missed: 'พลาดนัด',
  rescheduled: 'เลื่อนนัด',
};

const STATUS_COLOR: Record<Appointment['status'], string> = {
  upcoming: KHH_COLORS.MEDICATION_BLUE,
  confirmed: KHH_COLORS.SUCCESS_GREEN,
  completed: KHH_COLORS.TEXT_SECONDARY,
  missed: KHH_COLORS.EMERGENCY_RED,
  rescheduled: KHH_COLORS.WARNING_AMBER,
};

function formatThaiDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  } catch {
    return isoString;
  }
}

export function AppointmentCard({
  appointment,
  onPress,
}: {
  appointment: Appointment;
  onPress?: () => void;
}) {
  const color = STATUS_COLOR[appointment.status];
  const dateStr = formatThaiDate(appointment.date);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.stripe, { backgroundColor: color }]} />
      <View style={styles.body}>
        <View style={styles.rowBetween}>
          <View style={styles.dateWrap}>
            <Ionicons name="calendar" size={16} color={KHH_COLORS.PRIMARY_TEAL} />
            <Text style={styles.date}>{dateStr}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: `${color}1F` }]}>
            <Text style={[styles.badgeText, { color }]}>{STATUS_TH[appointment.status]}</Text>
          </View>
        </View>

        <Text style={styles.clinic}>{appointment.clinic}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={KHH_COLORS.TEXT_SECONDARY} />
            <Text style={styles.metaText}>{appointment.time}</Text>
          </View>

          {appointment.doctor ? (
            <View style={[styles.metaItem, { marginLeft: SPACING.md }]}>
              <Ionicons name="person-circle-outline" size={14} color={KHH_COLORS.TEXT_SECONDARY} />
              <Text style={styles.metaText}>{appointment.doctor}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.arrowWrap}>
        <Ionicons name="chevron-forward" size={18} color={KHH_COLORS.PRIMARY_TEAL} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KHH_COLORS.SURFACE,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  stripe: { width: 5, alignSelf: 'stretch' },
  body: { flex: 1, padding: SPACING.lg },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateWrap: { flexDirection: 'row', alignItems: 'center' },
  date: { ...TYPE.h2, color: KHH_COLORS.TEXT_PRIMARY, marginLeft: 6 },
  clinic: { ...TYPE.body, color: KHH_COLORS.DARK_TEAL, fontWeight: '600', marginTop: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, marginLeft: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.pill },
  badgeText: { fontSize: 12, fontWeight: '700' },
  arrowWrap: { paddingRight: SPACING.md },
});
