import React, { useState, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Alert, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { File } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { getCardById, deleteCard } from '../../db/database';
import { TravelCard } from '../../types';
import { colors } from '../../theme/colors';

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cardId = Number(id);
  const [card, setCard] = useState<TravelCard | null>(null);

  useFocusEffect(
    useCallback(() => {
      setCard(getCardById(cardId));
    }, [cardId])
  );

  async function handleOpenDocument() {
    if (!card) return;
    try {
      if (Platform.OS === 'android') {
        const ext = card.imagePath.split('.').pop()?.toLowerCase() ?? '';
        const mimeMap: Record<string, string> = {
          pdf: 'application/pdf',
          doc: 'application/msword',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          xls: 'application/vnd.ms-excel',
          xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
        const mimeType = mimeMap[ext] ?? '*/*';
        const contentUri = await FileSystem.getContentUriAsync(card.imagePath);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          type: mimeType,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        });
      } else {
        const available = await Sharing.isAvailableAsync();
        if (!available) {
          Alert.alert('Not supported', 'Opening documents is not supported on this device.');
          return;
        }
        await Sharing.shareAsync(card.imagePath);
      }
    } catch (e) {
      Alert.alert('Could not open', String(e));
    }
  }

  function handleDelete() {
    Alert.alert('Delete Card', `Delete "${card?.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          if (card) {
            const f = new File(card.imagePath);
            if (f.exists) f.delete();
          }
          deleteCard(cardId);
          router.back();
        },
      },
    ]);
  }

  if (!card) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {card.fileType === 'document' ? (
          <TouchableOpacity
            style={styles.docPreview}
            onPress={handleOpenDocument}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text-outline" size={64} color={colors.primary} />
            <Text style={styles.docName}>{card.imagePath.split('/').pop()}</Text>
            <View style={styles.openHint}>
              <Ionicons name="open-outline" size={14} color={colors.textMuted} />
              <Text style={styles.openHintText}>Tap to open</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <Image source={{ uri: card.imagePath }} style={styles.image} resizeMode="contain" />
        )}

        <View style={styles.infoCard}>
          <Text style={styles.label}>{card.label}</Text>
          <Text style={styles.meta}>Added {new Date(card.createdAt).toDateString()}</Text>
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>Delete Card</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 40 },
  image: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 20,
  },
  docPreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  docName: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 16 },
  openHint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  openHintText: { fontSize: 12, color: colors.textMuted },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 4 },
  meta: { fontSize: 13, color: colors.textMuted },
  deleteBtn: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  deleteBtnText: { color: colors.danger, fontWeight: '600', fontSize: 15 },
});
