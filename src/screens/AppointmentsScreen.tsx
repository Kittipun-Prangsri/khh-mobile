import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KHH_COLORS, RADIUS, SPACING, TYPE } from '@/theme/colors';
import { getMyAppointments } from '@/services/api';
import type { Appointment } from '@/types';
import { AppointmentCard } from '@/components/AppointmentCard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppointmentsStackParamList } from '@/navigation/MainTabs';

type Props = NativeStackScreenProps<AppointmentsStackParamList, 'AppointmentsList'>;

export function AppointmentsScreen({ navigation }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    getMyAppointments().then(setAppointments).catch(() => setAppointments([]));
  }, []);

  const filtered = appointments.filter((a) => {
    if (filter === 'upcoming') return a.status !== 'completed';
    if (filter === 'completed') return a.status === 'completed';
    return true;
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: SPACING.lg }}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>ตารางนัดหมายของฉัน</Text>
            <Text style={styles.subtitle}>นัดหมายตรวจติดตามอาการ NCDs โรงพยาบาลคลองหาด</Text>

            {/* Filter Pills */}
            <View style={styles.filterRow}>
              <Pressable
                style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
                onPress={() => setFilter('all')}
              >
                <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                  ทั้งหมด ({appointments.length})
                </Text>
              </Pressable>

              <Pressable
                style={[styles.filterPill, filter === 'upcoming' && styles.filterPillActive]}
                onPress={() => setFilter('upcoming')}
              >
                <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
                  กำลังจะถึง
                </Text>
              </Pressable>

              <Pressable
                style={[styles.filterPill, filter === 'completed' && styles.filterPillActive]}
                onPress={() => setFilter('completed')}
              >
                <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
                  เสร็จสิ้นแล้ว
                </Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="calendar-outline" size={48} color={KHH_COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyTitle}>ไม่มีรายการนัดหมาย</Text>
            <Text style={styles.emptySub}>ไม่พบนัดหมายในหมวดหมู่ที่เลือก</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KHH_COLORS.BACKGROUND },
  title: { ...TYPE.h1, color: KHH_COLORS.TEXT_PRIMARY },
  subtitle: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, marginTop: 4, marginBottom: SPACING.md },
  filterRow: { flexDirection: 'row', marginBottom: SPACING.lg },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: KHH_COLORS.SURFACE,
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
    marginRight: SPACING.xs,
  },
  filterPillActive: {
    backgroundColor: KHH_COLORS.PRIMARY_TEAL,
    borderColor: KHH_COLORS.PRIMARY_TEAL,
  },
  filterText: { fontSize: 13, color: KHH_COLORS.TEXT_SECONDARY, fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF' },
  emptyWrap: { alignItems: 'center', marginTop: SPACING.xxl, paddingHorizontal: SPACING.lg },
  emptyTitle: { ...TYPE.h2, color: KHH_COLORS.TEXT_PRIMARY, marginTop: SPACING.md },
  emptySub: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, marginTop: 4 },
});
