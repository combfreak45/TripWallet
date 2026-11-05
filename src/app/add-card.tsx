import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { router } from 'expo-router';
import { insertCard } from '../db/database';
import { colors } from '../theme/colors';

export default function AddCardScreen() {
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'document'>('image');
  const [label, setLabel] = useState('');

  function clearFile() {
    setFileUri(null);
    setFileName(null);
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setFileUri(result.assets[0].uri);
      setFileName(null);
      setFileType('image');
    }
  }

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to choose an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setFileUri(result.assets[0].uri);
      setFileName(null);
      setFileType('image');
    }
  }

  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setFileUri(result.assets[0].uri);
      setFileName(result.assets[0].name);
      setFileType('document');
    }
  }

  function validate(): boolean {
    if (!fileUri) { Alert.alert('Required', 'Please add a photo or document.'); return false; }
    if (!label.trim()) { Alert.alert('Required', 'Please enter a label.'); return false; }
    return true;
  }

  async function handleCreate() {
    if (!validate()) return;
    try {
      const cardsDir = new Directory(Paths.document, 'cards');
      if (!cardsDir.exists) cardsDir.create({ intermediates: true });

      let savedPath: string;
      if (fileType === 'document') {
        const ext = (fileName ?? 'doc').split('.').pop() ?? 'pdf';
        const destFile = new File(cardsDir, `${Date.now()}_card.${ext}`);
        new File(fileUri!).copy(destFile);
        savedPath = destFile.uri;
      } else {
        const destFile = new File(cardsDir, `${Date.now()}_card.jpg`);
        new File(fileUri!).copy(destFile);
        savedPath = destFile.uri;
      }

      insertCard({
        label: label.trim(),
        imagePath: savedPath,
        fileType,
        createdAt: new Date().toISOString(),
      });
      router.replace('/cards');
    } catch (e) {
      Alert.alert('Save failed', String(e));
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>New Card</Text>

        {fileUri ? (
          <View style={styles.previewWrap}>
            {fileType === 'image' ? (
              <Image source={{ uri: fileUri }} style={styles.preview} resizeMode="cover" />
            ) : (
              <View style={styles.docPreview}>
                <Ionicons name="document-text-outline" size={48} color={colors.primary} />
                <Text style={styles.docName} numberOfLines={2}>{fileName}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.removeBtn} onPress={clearFile} activeOpacity={0.8}>
              <Text style={styles.removeBtnText}>
                {fileType === 'image' ? 'Remove photo' : 'Remove document'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pickerRow}>
            <TouchableOpacity style={styles.pickBtn} onPress={takePhoto} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={26} color={colors.primary} />
              <Text style={styles.pickBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickBtn} onPress={pickFromGallery} activeOpacity={0.8}>
              <Ionicons name="images-outline" size={26} color={colors.primary} />
              <Text style={styles.pickBtnText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickBtn} onPress={pickDocument} activeOpacity={0.8}>
              <Ionicons name="document-outline" size={26} color={colors.primary} />
              <Text style={styles.pickBtnText}>Document</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Label</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. My Aadhaar"
            placeholderTextColor={colors.textPlaceholder}
            autoCapitalize="words"
          />
        </View>

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.8}>
          <Text style={styles.createBtnText}>Save Card</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20 },
  heading: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 24 },
  pickerRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  pickBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  pickBtnText: { color: colors.primary, fontWeight: '600', fontSize: 12 },
  previewWrap: { marginBottom: 24, alignItems: 'center' },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
  },
  docPreview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  docName: { fontSize: 14, color: colors.textSecondary, fontWeight: '500', textAlign: 'center' },
  removeBtn: { marginTop: 10, paddingHorizontal: 12, paddingVertical: 6 },
  removeBtnText: { color: colors.danger, fontWeight: '600', fontSize: 14 },
  field: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 15,
    color: colors.text,
  },
  createBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createBtnText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
});
