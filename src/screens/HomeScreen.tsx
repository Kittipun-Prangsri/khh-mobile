import React, { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KHH_COLORS, RADIUS, SPACING, TYPE } from '@/theme/colors';
import { useAuth } from '@/context/AuthContext';
import { getMyAppointments, getBadges, getVitals } from '@/services/api';
import type { Appointment, Badge, VitalReading } from '@/types';
import { AppointmentCard } from '@/components/AppointmentCard';
import { BadgeCard } from '@/components/BadgeCard';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '@/navigation/MainTabs';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { patient } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [appts, b, v] = await Promise.all([getMyAppointments(), getBadges(), getVitals()]);
      setAppointments(appts);
      setBadges(b);
      setVitals(v);
    } catch {
      // Handled in API fallback
    }
  };

  useEffect(() => {
    load();
  }, []);

  const nextAppointment = appointments.find((a) => a.status !== 'completed');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
    >
      {/* Hospital & Patient Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.hospitalTag}>
            <Ionicons name="medical" size={14} color="#CCFBF1" />
            <Text style={styles.hospitalText}>โรงพยาบาลคลองหาด · NCDs Care</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#10B981" />
            <Text style={styles.verifiedText}>ยืนยันตัวตนแล้ว</Text>
          </View>
        </View>

        <View style={styles.patientInfoRow}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={28} color={KHH_COLORS.PRIMARY_TEAL} />
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.patientName}>{patient?.name ?? 'ผู้ป่วย'}</Text>
            <Text style={styles.patientHn}>HN: {patient?.hn ?? '-'}</Text>
          </View>
        </View>

        <View style={styles.statsSummaryRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{appointments.length}</Text>
            <Text style={styles.statLabel}>นัดหมาย</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{vitals.length}</Text>
            <Text style={styles.statLabel}>ผลตรวจแล็บ</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{badges.length}</Text>
            <Text style={styles.statLabel}>เหรียญความดี</Text>
          </View>
        </View>
      </View>

      {/* Emergency Banner */}
      <Pressable style={styles.emergencyBanner} onPress={() => navigation.navigate('Contact')}>
        <View style={styles.emergencyIconWrap}>
          <Ionicons name="alert-circle" size={24} color="#FFF" />
        </View>
        <View style={{ flex: 1, marginLeft: SPACING.sm }}>
          <Text style={styles.emergencyTitle}>เจ็บป่วยฉุกเฉิน โทร 1669 ทันที</Text>
          <Text style={styles.emergencySub}>สงสัยอาการหลอดเลือดสมอง / หัวใจ (B.E.F.A.S.T)</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#FFF" />
      </Pressable>

      {/* Quick Action Grid */}
      <View style={styles.quickGrid}>
        <Pressable style={styles.actionTile} onPress={() => navigation.navigate('Appointments')}>
          <View style={[styles.actionIconBox, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="calendar" size={22} color={KHH_COLORS.MEDICATION_BLUE} />
          </View>
          <Text style={styles.actionTileText}>นัดหมายของฉัน</Text>
        </Pressable>

        <Pressable style={styles.actionTile} onPress={() => navigation.navigate('Vitals')}>
          <View style={[styles.actionIconBox, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="pulse" size={22} color={KHH_COLORS.DIET_GREEN} />
          </View>
          <Text style={styles.actionTileText}>ผลตรวจสุขภาพ</Text>
        </Pressable>

        <Pressable style={styles.actionTile} onPress={() => navigation.navigate('HealthEducation')}>
          <View style={[styles.actionIconBox, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="book" size={22} color={KHH_COLORS.MENTAL_PURPLE} />
          </View>
          <Text style={styles.actionTileText}>ความรู้ NCDs</Text>
        </Pressable>

        <Pressable style={styles.actionTile} onPress={() => navigation.navigate('Contact')}>
          <View style={[styles.actionIconBox, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="call" size={22} color={KHH_COLORS.EXERCISE_ORANGE} />
          </View>
          <Text style={styles.actionTileText}>ติดต่อโรงพยาบาล</Text>
        </Pressable>
      </View>

      {/* Next Appointment Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>นัดหมายถัดไป</Text>
        <Pressable onPress={() => navigation.navigate('Appointments')}>
          <Text style={styles.seeAllText}>ดูทั้งหมด ({appointments.length})</Text>
        </Pressable>
      </View>

      {nextAppointment ? (
        <AppointmentCard
          appointment={nextAppointment}
          onPress={() => navigation.navigate('Appointments')}
        />
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={32} color={KHH_COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyText}>ไม่มีนัดหมายที่กำลังจะถึงในขณะนี้</Text>
        </View>
      )}

      {/* Badges Carousel Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>เหรียญตราความสำเร็จ</Text>
        <Text style={styles.badgeCount}>{badges.length} เหรียญ</Text>
      </View>

      {badges.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.xl }}>
          {badges.map((b) => (
            <BadgeCard key={b.id} badge={b} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="ribbon-outline" size={32} color={KHH_COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyText}>ยังไม่มีเหรียญตรา เริ่มดูแลสุขภาพวันนี้เพื่อรับรางวัล!</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KHH_COLORS.BACKGROUND },
  contentContainer: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  headerCard: {
    backgroundColor: KHH_COLORS.PRIMARY_TEAL,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  hospitalTag: { flexDirection: 'row', alignItems: 'center' },
  hospitalText: { fontSize: 12, color: '#CCFBF1', marginLeft: 4, fontWeight: '600' },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  verifiedText: { fontSize: 10, color: '#047857', fontWeight: '700', marginLeft: 3 },
  patientInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientName: { ...TYPE.h1, color: '#FFFFFF' },
  patientHn: { ...TYPE.body, color: '#CCFBF1', marginTop: 2 },
  statsSummaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: 11, color: '#CCFBF1', marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KHH_COLORS.EMERGENCY_RED,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  emergencyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: { ...TYPE.h2, color: KHH_COLORS.TEXT_ON_PRIMARY, fontSize: 14 },
  emergencySub: { fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  actionTile: {
    width: '23%',
    backgroundColor: KHH_COLORS.SURFACE,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  actionTileText: { fontSize: 11, fontWeight: '600', color: KHH_COLORS.TEXT_PRIMARY, textAlign: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: { ...TYPE.h2, color: KHH_COLORS.TEXT_PRIMARY },
  seeAllText: { fontSize: 13, color: KHH_COLORS.PRIMARY_TEAL, fontWeight: '600' },
  badgeCount: { fontSize: 12, color: KHH_COLORS.TEXT_SECONDARY },
  emptyCard: {
    backgroundColor: KHH_COLORS.SURFACE,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { ...TYPE.body, color: KHH_COLORS.TEXT_SECONDARY, textAlign: 'center', marginTop: SPACING.sm },
});
