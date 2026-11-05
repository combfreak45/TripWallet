import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../theme/colors';

export default function Footer() {
  return (
    <View style={styles.bar}>
      <TouchableOpacity
        style={styles.walletBtn}
        onPress={() => router.push('/cards')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Open travel cards"
      >
        <Ionicons name="wallet-outline" size={26} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  walletBtn: {
    padding: 6,
  },
});
