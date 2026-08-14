import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { KHH_COLORS, RADIUS, SPACING, TYPE } from '@/theme/colors';

export function PrimaryButton({
  label,
  onPress,
  disabled,
  color = KHH_COLORS.PRIMARY_TEAL,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}) {
  return (
    <Pressable
      style={[styles.button, { backgroundColor: disabled ? KHH_COLORS.BORDER : color }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.label, disabled && { color: KHH_COLORS.TEXT_SECONDARY }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  label: { ...TYPE.body, fontWeight: '700', color: KHH_COLORS.TEXT_ON_PRIMARY },
});
