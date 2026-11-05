import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TravelCard } from '../types';
import { colors } from '../theme/colors';

interface Props {
  card: TravelCard;
  onPress: () => void;
  onDelete: () => void;
}

export default function CardItem({ card, onPress, onDelete }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {card.fileType === 'document' ? (
        <View style={styles.docThumb}>
          <Ionicons name="document-text-outline" size={40} color={colors.primary} />
        </View>
      ) : (
        <Image source={{ uri: card.imagePath }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.footer}>
        <Text style={styles.label} numberOfLines={1}>{card.label}</Text>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surfaceAlt,
  },
  docThumb: {
    width: '100%',
    height: 100,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  label: { fontSize: 17, fontWeight: '700', color: colors.text, flex: 1, marginRight: 8 },
});
