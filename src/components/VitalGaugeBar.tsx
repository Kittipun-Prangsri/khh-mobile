import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KHH_COLORS, RADIUS, SPACING, TYPE } from '@/theme/colors';
import type { VitalReading } from '@/types';

const STATUS_COLOR: Record<VitalReading['status'], string> = {
  good: KHH_COLORS.SUCCESS_GREEN,
  watch: KHH_COLORS.WARNING_AMBER,
  risk: KHH_COLORS.EMERGENCY_RED,
};

const STATUS_LABEL: Record<VitalReading['status'], string> = {
  good: 'ปกติ',
  watch: 'เฝ้าระวัง',
  risk: 'ความเสี่ยงสูง',
};

const LABEL_TH: Record<VitalReading['label'], string> = {
  BMI: 'ดัชนีมวลกาย (BMI)',
  BloodPressure: 'ความดันโลหิต',
  FBS: 'น้ำตาลในเลือด (FBS)',
  HbA1c: 'น้ำตาลสะสม (HbA1c)',
  eGFR: 'การทำงานของไต (eGFR)',
};

const LABEL_ICON: Record<VitalReading['label'], keyof typeof Ionicons.glyphMap> = {
  BMI: 'body-outline',
  BloodPressure: 'pulse-outline',
  FBS: 'water-outline',
  HbA1c: 'analytics-outline',
  eGFR: 'fitness-outline',
};

export function VitalGaugeBar({ reading }: { reading: VitalReading }) {
  const range = Math.max(reading.max - reading.min, 1);
  const pct = Math.min(100, Math.max(0, ((reading.value - reading.min) / range) * 100));
  const color = STATUS_COLOR[reading.status];

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <View style={[styles.iconBox, { backgroundColor: `${color}1F` }]}>
            <Ionicons name={LABEL_ICON[reading.label]} size={18} color={color} />
          </View>
          <Text style={styles.label}>{LABEL_TH[reading.label]}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${color}1F` }]}>
          <Text style={[styles.statusText, { color }]}>{STATUS_LABEL[reading.status]}</Text>
        </View>
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color }]}>
          {reading.value} <Text style={styles.unit}>{reading.unit}</Text>
        </Text>
        <Text style={styles.targetRange}>
          เป้าหมาย: {reading.targetMin} - {reading.targetMax} {reading.unit}
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>

      <View style={styles.scaleRow}>
        <Text style={styles.scaleText}>{reading.min}</Text>
        <Text style={styles.scaleText}>{reading.max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: KHH_COLORS.SURFACE,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  titleWrap: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  label: { ...TYPE.body, color: KHH_COLORS.TEXT_PRIMARY, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.pill },
  statusText: { fontSize: 12, fontWeight: '700' },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  value: { fontSize: 22, fontWeight: '800' },
  unit: { fontSize: 13, fontWeight: '400', color: KHH_COLORS.TEXT_SECONDARY },
  targetRange: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY },
  track: {
    height: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: KHH_COLORS.BORDER,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: RADIUS.pill },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  scaleText: { fontSize: 11, color: KHH_COLORS.TEXT_SECONDARY },
});
