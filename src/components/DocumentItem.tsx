import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { File } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { TripDocument } from '../types';
import { colors } from '../theme/colors';

interface Props {
  document: TripDocument;
  onDelete: (id: number) => void;
}

const ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
  default: '📎',
};

export default function DocumentItem({ document, onDelete }: Props) {
  const icon = ICONS[document.mimeType] ?? ICONS.default;
  const sizeKB = (document.size / 1024).toFixed(1);

  async function handleOpen() {
    const file = new File(document.localPath);
    if (!file.exists) {
      Alert.alert('File not found', 'The file may have been moved or deleted.');
      return;
    }
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: file.contentUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: document.mimeType,
      });
    } else {
      await Sharing.shareAsync(file.uri);
    }
  }

  function handleDelete() {
    Alert.alert('Remove document', `Remove "${document.name}" from this trip?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onDelete(document.id) },
    ]);
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.left} onPress={handleOpen} activeOpacity={0.7}>
        <Text style={styles.icon}>{icon}</Text>
        <View>
          <Text style={styles.name} numberOfLines={1}>{document.name}</Text>
          <Text style={styles.meta}>{sizeKB} KB</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    padding: 12,
    marginVertical: 5,
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  icon: { fontSize: 24, marginRight: 12 },
  name: { fontSize: 14, fontWeight: '600', color: colors.text, maxWidth: 220 },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  deleteBtn: { padding: 6 },
  deleteText: { fontSize: 14, color: colors.danger, fontWeight: '700' },
});
