import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Trip } from '../types';
import { colors } from '../theme/colors';

interface Props {
  trip: Trip;
  onPress: () => void;
}

export default function TripCard({ trip, onPress }: Props) {
  const start = new Date(trip.startDate).toDateString();
  const end = new Date(trip.endDate).toDateString();
  const isUpcoming = new Date(trip.startDate) >= new Date();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{isUpcoming ? 'Upcoming' : 'Past'}</Text>
      </View>
      <Text style={styles.name}>{trip.name}</Text>
      <Text style={styles.route}>
        {trip.startLocation} → {trip.endLocation}
      </Text>
      <Text style={styles.dates}>{start} – {end}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  badgeText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  name: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 },
  route: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  dates: { fontSize: 13, color: colors.textMuted },
});
