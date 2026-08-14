import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KHH_COLORS, RADIUS, SPACING, TYPE } from '@/theme/colors';
import type { Badge } from '@/types';

export function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <View style={styles.card}>
      <View style={styles.emojiCircle}>
        <Text style={styles.emoji}>{badge.emoji}</Text>
      </View>
      <Text style={styles.title} numberOfLines={1}>{badge.titleTh}</Text>
      <Text style={styles.criteria} numberOfLines={2}>{badge.criteria}</Text>
      <View style={styles.dateTag}>
        <Text style={styles.date}>ได้รับแล้ว {badge.earnedAt}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: KHH_COLORS.SURFACE,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
    padding: SPACING.md,
    marginRight: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  emojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0FDFA',
    borderWidth: 2,
    borderColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  emoji: { fontSize: 26 },
  title: { ...TYPE.body, fontWeight: '700', textAlign: 'center', color: KHH_COLORS.TEXT_PRIMARY },
  criteria: {
    ...TYPE.caption,
    color: KHH_COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 4,
    height: 32,
  },
  dateTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    marginTop: SPACING.xs,
  },
  date: { fontSize: 10, color: KHH_COLORS.TEXT_SECONDARY, fontWeight: '600' },
});
