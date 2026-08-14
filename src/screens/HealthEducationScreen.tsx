import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KHH_COLORS, RADIUS, SPACING, TYPE } from '@/theme/colors';
import { getHealthArticles } from '@/services/api';
import type { HealthArticle } from '@/types';

const CATEGORY_META: Record<
  HealthArticle['category'],
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  diet: { label: 'อาหารและโภชนาการ', icon: 'restaurant', color: KHH_COLORS.DIET_GREEN, bg: '#DCFCE7' },
  medication: { label: 'การใช้ยาอย่างถูกต้อง', icon: 'medkit', color: KHH_COLORS.MEDICATION_BLUE, bg: '#E0F2FE' },
  exercise: { label: 'การออกกำลังกาย', icon: 'walk', color: KHH_COLORS.EXERCISE_ORANGE, bg: '#FFEDD5' },
  thai_medicine: { label: 'การแพทย์แผนไทย', icon: 'leaf', color: KHH_COLORS.THAI_MEDICINE_GREEN, bg: '#D1FAE5' },
  mental_health: { label: 'สุขภาพจิตและการผ่อนคลาย', icon: 'heart', color: KHH_COLORS.MENTAL_PURPLE, bg: '#F3E8FF' },
};

export function HealthEducationScreen() {
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    getHealthArticles().then(setArticles).catch(() => setArticles([]));
  }, []);

  const filteredArticles = selectedCategory
    ? articles.filter((a) => a.category === selectedCategory)
    : articles;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }}
      data={filteredArticles}
      keyExtractor={(a) => a.id}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>คลังความรู้สุขภาพ NCDs</Text>
          <Text style={styles.subtitle}>คำแนะนำการดูแลตนเองจากทีมแพทย์และบุคลากรโรงพยาบาลคลองหาด</Text>

          {/* Category Filter Horizontal Scroll */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: SPACING.lg }}
            data={Object.entries(CATEGORY_META)}
            keyExtractor={([key]) => key}
            renderItem={({ item: [key, meta] }) => {
              const active = selectedCategory === key;
              return (
                <Pressable
                  style={[
                    styles.catPill,
                    active ? { backgroundColor: meta.color, borderColor: meta.color } : null,
                  ]}
                  onPress={() => setSelectedCategory(active ? null : key)}
                >
                  <Ionicons name={meta.icon} size={14} color={active ? '#FFF' : meta.color} />
                  <Text style={[styles.catPillText, active && { color: '#FFF' }]}>{meta.label}</Text>
                </Pressable>
              );
            }}
          />
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Ionicons name="journal-outline" size={40} color={KHH_COLORS.TEXT_SECONDARY} />
          <Text style={styles.empty}>ยังไม่มีบทความในหมวดหมู่นี้</Text>
        </View>
      }
      renderItem={({ item }) => {
        const meta = CATEGORY_META[item.category];
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: meta.bg }]}>
                <Ionicons name={meta.icon} size={12} color={meta.color} />
                <Text style={[styles.categoryText, { color: meta.color }]}>{meta.label}</Text>
              </View>
              <Text style={styles.readTime}>อ่าน 3 นาที</Text>
            </View>

            <Text style={styles.cardTitle}>{item.titleTh}</Text>
            <Text style={styles.cardSummary}>{item.summaryTh}</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.author}>โรงพยาบาลคลองหาด</Text>
              <View style={styles.readMore}>
                <Text style={styles.readMoreText}>อ่านเพิ่มเติม</Text>
                <Ionicons name="arrow-forward" size={14} color={KHH_COLORS.PRIMARY_TEAL} />
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KHH_COLORS.BACKGROUND },
  title: { ...TYPE.h1, color: KHH_COLORS.TEXT_PRIMARY },
  subtitle: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, marginTop: 4, marginBottom: SPACING.md },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: KHH_COLORS.SURFACE,
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
    marginRight: SPACING.xs,
  },
  catPillText: { fontSize: 12, fontWeight: '600', color: KHH_COLORS.TEXT_PRIMARY, marginLeft: 4 },
  card: {
    backgroundColor: KHH_COLORS.SURFACE,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.pill },
  categoryText: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
  readTime: { fontSize: 11, color: KHH_COLORS.TEXT_SECONDARY },
  cardTitle: { ...TYPE.h2, color: KHH_COLORS.TEXT_PRIMARY, marginTop: 4 },
  cardSummary: { ...TYPE.caption, color: KHH_COLORS.TEXT_SECONDARY, marginTop: 6, lineHeight: 18 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: KHH_COLORS.BORDER,
  },
  author: { fontSize: 11, color: KHH_COLORS.TEXT_SECONDARY },
  readMore: { flexDirection: 'row', alignItems: 'center' },
  readMoreText: { fontSize: 12, color: KHH_COLORS.PRIMARY_TEAL, fontWeight: '700', marginRight: 2 },
  emptyCard: {
    backgroundColor: KHH_COLORS.SURFACE,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: KHH_COLORS.BORDER,
  },
  empty: { ...TYPE.body, color: KHH_COLORS.TEXT_SECONDARY, textAlign: 'center', marginTop: SPACING.sm },
});
