import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KHH_COLORS, RADIUS, SPACING, TYPE } from '@/theme/colors';
import { getVitals } from '@/services/api';
import type { VitalReading } from '@/types';
import { VitalGaugeBar } from '@/components/VitalGaugeBar';

export function VitalsScreen() {
  const [vitals, setVitals] = useState<VitalReading[]>([]);

  useEffect(() => {
    getVitals().then(setVitals).catch(() => setVitals([]));
  }, []);

  const goodCount = vitals.filter((v) => v.status === 'good').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }}>
      <Text style={styles.title}>ผลตรวจสุขภาพ NCDs</Text>
      <Text style={styles.subtitle}>ข้อมูลล่าสุดเชื่อมโยงตรงจากระบบ HOSxP โรงพยาบาลคลองหาด</Text>

      {/* Summary Banner */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryIconBox}>
          <Ionicons name="shield-checkmark" size={24} color={KHH_COLORS.PRIMARY_TEAL} />
        </View>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.summaryTitle}>ภาพรวมผลตรวจสุขภาพ</Text>
          <Text style={styles.summaryText}>
            อยู่ในเกณฑ์ปกติ <Text style={{ fontWeight: '700', color: KHH_COLORS.SUCCESS_GREEN }}>{goodCount}</Text> จาก {vitals.length} รายการ
          </Text>
        </View>
      </View>

      <View style={styles.vitalsList}>
        {vitals.length > 0 ? (
          vitals.map((v) => <VitalGaugeBar key={v.label} reading={v} />)
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="analytics-outline" size={40} color={KHH_COLORS.TEXT_SECONDARY} />
            <Text style={styles.empty}>ยังไม่มีผลตรวจล่าสุดในระบบ</Text>
          </View>
        )}
      </View>

      <View style={styles.disclaimerCard}>
        <Ionicons name="information-circle-outline" size={18} color={KHH_COLORS.TEXT_SECONDARY} />
        <Text style={styles.disclaimer}>
          ผลตรวจเป็นข้อมูลทางการแพทย์เพื่อการติดตามอาการ หากค่าผิดปกติกรุณาพบแพทย์คลินิก NCDs ตามนัดหมาย
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KHH_COLORS.BACKGROUND },
  title: { ...TYPE.h1, color: KHH_COLORS.TEXT_PRIMARY },
  subtitle: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, marginTop: 4, marginBottom: SPACING.lg },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: SPACING.lg,
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: { ...TYPE.body, fontWeight: '700', color: KHH_COLORS.DARK_TEAL },
  summaryText: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, marginTop: 2 },
  vitalsList: { marginBottom: SPACING.md },
  emptyCard: {
    backgroundColor: KHH_COLORS.SURFACE,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
  },
  empty: { ...TYPE.body, color: KHH_COLORS.TEXT_SECONDARY, textAlign: 'center', marginTop: SPACING.sm },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: KHH_COLORS.SURFACE,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
  },
  disclaimer: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, marginLeft: SPACING.xs, flex: 1 },
});
