import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KHH_COLORS, RADIUS, SPACING, TYPE } from '@/theme/colors';
import { KHH_CONTACTS } from '@/constants/contacts';

function ContactRow({
  icon,
  label,
  sub,
  uri,
  color = KHH_COLORS.PRIMARY_TEAL,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub?: string;
  uri: string;
  color?: string;
}) {
  return (
    <Pressable style={styles.row} onPress={() => Linking.openURL(uri)}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}1F` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: SPACING.md }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={KHH_COLORS.TEXT_SECONDARY} />
    </Pressable>
  );
}

export function ContactScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }}>
      <Text style={styles.title}>ติดต่อและช่วยเหลือฉุกเฉิน</Text>
      <Text style={styles.subtitle}>ช่องทางการติดต่อโรงพยาบาลคลองหาด และสายด่วนบริการ 24 ชั่วโมง</Text>

      {/* Emergency Call Card */}
      <Pressable
        style={styles.emergencyCard}
        onPress={() => Linking.openURL(KHH_CONTACTS.EMERGENCY_1669_URI)}
      >
        <View style={styles.emergencyIconPulse}>
          <Ionicons name="alert-circle" size={32} color="#FFF" />
        </View>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.emergencyTitle}>ศูนย์รับแจ้งเหตุฉุกเฉิน 1669</Text>
          <Text style={styles.emergencySub}>โทรฟรีตลอด 24 ชั่วโมง กรณีเจ็บป่วยฉุกเฉินวิกฤต</Text>
          <View style={styles.callNowBtn}>
            <Ionicons name="call" size={14} color={KHH_COLORS.EMERGENCY_RED} />
            <Text style={styles.callNowText}>กดโทรออกทันที</Text>
          </View>
        </View>
      </Pressable>

      <Text style={styles.sectionHeader}>หน่วยงานภายในโรงพยาบาล</Text>

      <View style={styles.sectionCard}>
        <ContactRow
          icon="call"
          label="คลินิก NCDs (โรคเรื้อรัง)"
          sub={KHH_CONTACTS.NCD_CLINIC_PHONE_DISPLAY}
          uri={KHH_CONTACTS.NCD_CLINIC_PHONE_URI}
        />
        <ContactRow
          icon="heart"
          label="หน่วยงานสุขภาพจิตและจิตเวช"
          sub={KHH_CONTACTS.MENTAL_HEALTH_PHONE_DISPLAY}
          uri={KHH_CONTACTS.MENTAL_HEALTH_PHONE_URI}
          color={KHH_COLORS.MENTAL_PURPLE}
        />
        <ContactRow
          icon="chatbubbles"
          label="สายด่วนสุขภาพจิต 1323"
          sub="ให้คำปรึกษาปัญหาความเครียดตลอด 24 ชั่วโมง"
          uri={KHH_CONTACTS.HOTLINE_1323_URI}
          color={KHH_COLORS.MENTAL_PURPLE}
        />
        <ContactRow
          icon="map"
          label="แผนที่และเส้นทางนำทาง"
          sub="อำเภอคลองหาด จังหวัดสระแก้ว"
          uri={KHH_CONTACTS.MAPS_LOCATION_URI}
          color={KHH_COLORS.DARK_TEAL}
        />
      </View>

      {/* Hospital Operating Hours */}
      <View style={styles.hoursCard}>
        <Ionicons name="time-outline" size={20} color={KHH_COLORS.PRIMARY_TEAL} />
        <View style={{ marginLeft: SPACING.sm }}>
          <Text style={styles.hoursTitle}>เวลาทำการคลินิก NCDs</Text>
          <Text style={styles.hoursText}>วันจันทร์ - ศุกร์ : 08.00 น. - 16.00 น.</Text>
          <Text style={styles.hoursText}>แผนกฉุกเฉิน (ER) : เปิดบริการ 24 ชั่วโมง</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KHH_COLORS.BACKGROUND },
  title: { ...TYPE.h1, color: KHH_COLORS.TEXT_PRIMARY },
  subtitle: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, marginTop: 4, marginBottom: SPACING.lg },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KHH_COLORS.EMERGENCY_RED,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emergencyIconPulse: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: { ...TYPE.h2, color: KHH_COLORS.TEXT_ON_PRIMARY, fontSize: 16 },
  emergencySub: { fontSize: 11, color: 'rgba(255, 255, 255, 0.9)', marginTop: 2 },
  callNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    marginTop: SPACING.sm,
  },
  callNowText: { fontSize: 12, fontWeight: '700', color: KHH_COLORS.EMERGENCY_RED, marginLeft: 4 },
  sectionHeader: { ...TYPE.h2, color: KHH_COLORS.TEXT_PRIMARY, marginBottom: SPACING.sm },
  sectionCard: {
    backgroundColor: KHH_COLORS.SURFACE,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: KHH_COLORS.BORDER,
  },
  iconWrap: { width: 40, height: 40, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { ...TYPE.body, color: KHH_COLORS.TEXT_PRIMARY, fontWeight: '600' },
  rowSub: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, marginTop: 2 },
  hoursCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDFA',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  hoursTitle: { ...TYPE.body, fontWeight: '700', color: KHH_COLORS.DARK_TEAL },
  hoursText: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, marginTop: 2 },
});
