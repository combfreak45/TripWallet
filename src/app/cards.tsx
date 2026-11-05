import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Modal, Image, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { getAllCards, deleteCard } from '../db/database';
import { TravelCard } from '../types';
import CardItem from '../components/CardItem';
import { colors } from '../theme/colors';

export default function CardsScreen() {
  const [cards, setCards] = useState<TravelCard[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setCards(getAllCards());
    }, [])
  );

  function handleDelete(card: TravelCard) {
    Alert.alert('Delete Card', `Delete "${card.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          const f = new File(card.imagePath);
          if (f.exists) f.delete();
          deleteCard(card.id);
          setCards((prev) => prev.filter((c) => c.id !== card.id));
        },
      },
    ]);
  }

  async function handleOpen(card: TravelCard) {
    if (card.fileType === 'image') {
      setPreviewImage(card.imagePath);
      return;
    }
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
        const contentUri = await FileSystem.getContentUriAsync(card.imagePath);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          type: mimeMap[ext] ?? '*/*',
          flags: 1,
        });
      } else {
        await Sharing.shareAsync(card.imagePath);
      }
    } catch (e) {
      Alert.alert('Could not open', String(e));
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/add-card')} activeOpacity={0.8}>
              <Text style={styles.headerAdd}>+ Add</Text>
            </TouchableOpacity>
          ),
        }}
      />

      {cards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text style={styles.emptyText}>No cards yet</Text>
          <Text style={styles.emptySubText}>
            Tap &quot;Add&quot; to save Aadhaar, PAN, license &amp; more
          </Text>
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <CardItem
              card={item}
              onPress={() => handleOpen(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      )}

      <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setPreviewImage(null)} activeOpacity={0.8}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {previewImage && (
            <Image source={{ uri: previewImage }} style={styles.modalImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerAdd: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#444' },
  emptySubText: { fontSize: 14, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
});
