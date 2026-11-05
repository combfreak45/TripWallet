import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { insertTrip } from '../db/database';
import { colors } from '../theme/colors';

function toISO(date: Date) {
  return date.toISOString().split('T')[0];
}

function formatDisplay(date: Date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AddTripScreen() {
  const [name, setName] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);

  function handleDateValue(_event: unknown, date: Date) {
    if (Platform.OS === 'android') setActivePicker(null);
    if (activePicker === 'start') setStartDate(date);
    else if (activePicker === 'end') setEndDate(date);
  }

  function validate(): boolean {
    if (!name.trim()) { Alert.alert('Required', 'Please enter a trip name.'); return false; }
    if (!startLocation.trim()) { Alert.alert('Required', 'Please enter a start location.'); return false; }
    if (!endLocation.trim()) { Alert.alert('Required', 'Please enter an end location.'); return false; }
    if (!startDate) { Alert.alert('Required', 'Please select a start date.'); return false; }
    if (!endDate) { Alert.alert('Required', 'Please select an end date.'); return false; }
    if (startDate > endDate) {
      Alert.alert('Invalid dates', 'Start date must be before end date.');
      return false;
    }
    return true;
  }

  function handleCreate() {
    if (!validate()) return;
    const id = insertTrip({
      name: name.trim(),
      startLocation: startLocation.trim(),
      endLocation: endLocation.trim(),
      startDate: toISO(startDate!),
      endDate: toISO(endDate!),
      createdAt: new Date().toISOString(),
    });
    router.replace(`/trip/${id}`);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>New Trip</Text>

        <Field label="Trip Name" value={name} onChange={setName} placeholder="e.g. Goa Vacation" />
        <Field label="From" value={startLocation} onChange={setStartLocation} placeholder="e.g. Mumbai" />
        <Field label="To" value={endLocation} onChange={setEndLocation} placeholder="e.g. Goa" />

        <DateField label="Start Date" value={startDate} onPress={() => setActivePicker('start')} />
        <DateField label="End Date" value={endDate} onPress={() => setActivePicker('end')} />

        {activePicker !== null && (
          <DateTimePicker
            value={activePicker === 'start' ? (startDate ?? new Date()) : (endDate ?? new Date())}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onValueChange={handleDateValue}
            onDismiss={() => setActivePicker(null)}
          />
        )}

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.8}>
          <Text style={styles.createBtnText}>Create Trip</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        autoCapitalize="words"
      />
    </View>
  );
}

function DateField({ label, value, onPress }: { label: string; value: Date | null; onPress: () => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateInput} onPress={onPress} activeOpacity={0.7}>
        <Text style={value ? styles.dateText : styles.datePlaceholder}>
          {value ? formatDisplay(value) : 'Select date'}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20 },
  heading: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 24 },
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
  dateText: { fontSize: 15, color: colors.text },
  datePlaceholder: { fontSize: 15, color: colors.textPlaceholder },
  dateInput: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
