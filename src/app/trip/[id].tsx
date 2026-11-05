import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { copyAsync } from 'expo-file-system/legacy';
import {
  getTripById, getDocumentsByTrip, insertDocument,
  deleteDocument, deleteTrip,
} from '../../db/database';
import { Trip, TripDocument } from '../../types';
import DocumentItem from '../../components/DocumentItem';
import { colors } from '../../theme/colors';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripId = Number(id);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [documents, setDocuments] = useState<TripDocument[]>([]);

  useFocusEffect(
    useCallback(() => {
      setTrip(getTripById(tripId));
      setDocuments(getDocumentsByTrip(tripId));
    }, [tripId])
  );

  async function handleUpload() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      multiple: true,
      copyToCacheDirectory: false,
    });

    if (result.canceled) return;

    try {
      for (const asset of result.assets) {
        const tripDir = new Directory(Paths.document, 'trips', String(tripId));
        if (!tripDir.exists) tripDir.create({ intermediates: true });

        const destFile = new File(tripDir, `${Date.now()}_${asset.name}`);
        await copyAsync({ from: asset.uri, to: destFile.uri });

        insertDocument({
          tripId,
          name: asset.name,
          localPath: destFile.uri,
          mimeType: asset.mimeType ?? 'application/octet-stream',
          size: asset.size ?? 0,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      Alert.alert('Upload failed', String(e));
    }

    setDocuments(getDocumentsByTrip(tripId));
  }

  function handleDeleteDocument(docId: number) {
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      const f = new File(doc.localPath);
      if (f.exists) f.delete();
    }
    deleteDocument(docId);
    setDocuments(getDocumentsByTrip(tripId));
  }

  function handleDeleteTrip() {
    Alert.alert('Delete Trip', `Delete "${trip?.name}" and all its documents?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          const tripDir = new Directory(Paths.document, 'trips', String(tripId));
          if (tripDir.exists) tripDir.delete();
          deleteTrip(tripId);
          router.back();
        },
      },
    ]);
  }

  if (!trip) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.infoCard}>
          <Text style={styles.tripName}>{trip.name}</Text>
          <Text style={styles.route}>{trip.startLocation} → {trip.endLocation}</Text>
          <View style={styles.datesRow}>
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>DEPART</Text>
              <Text style={styles.dateValue}>{new Date(trip.startDate).toDateString()}</Text>
            </View>
            <View style={styles.dateDivider} />
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>RETURN</Text>
              <Text style={styles.dateValue}>{new Date(trip.endDate).toDateString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Documents ({documents.length})</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} activeOpacity={0.8}>
              <Text style={styles.uploadBtnText}>+ Upload</Text>
            </TouchableOpacity>
          </View>

          {documents.length === 0 ? (
            <View style={styles.emptyDocs}>
              <Text style={styles.emptyDocsText}>No documents yet. Upload tickets, bookings, etc.</Text>
            </View>
          ) : (
            documents.map((doc) => (
              <DocumentItem key={doc.id} document={doc} onDelete={handleDeleteDocument} />
            ))
          )}
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteTrip} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>Delete Trip</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 40 },
  infoCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tripName: { fontSize: 22, fontWeight: '800', color: colors.surface, marginBottom: 4 },
  route: { fontSize: 15, color: colors.primaryMuted, marginBottom: 16 },
  datesRow: { flexDirection: 'row', alignItems: 'center' },
  dateBlock: { flex: 1 },
  dateDivider: { width: 1, height: 36, backgroundColor: colors.primaryDim, marginHorizontal: 12 },
  dateLabel: { fontSize: 10, color: colors.primarySubtle, fontWeight: '700', letterSpacing: 1 },
  dateValue: { fontSize: 13, color: colors.surface, fontWeight: '600', marginTop: 2 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  uploadBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  uploadBtnText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  emptyDocs: { paddingVertical: 20, alignItems: 'center' },
  emptyDocsText: { color: colors.textPlaceholder, fontSize: 14, textAlign: 'center' },
  deleteBtn: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  deleteBtnText: { color: colors.danger, fontWeight: '600', fontSize: 15 },
});
