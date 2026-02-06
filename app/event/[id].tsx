import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { eventService } from '@/services/eventService';
import { useAuth, useAlert } from '@/template';
import type { Event, EventAttendee } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const formattedDate = useMemo(() => {
    if (!event?.event_date) return '';
    return new Date(event.event_date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [event?.event_date]);

  const formattedTime = useMemo(() => {
    if (!event?.event_date) return '';
    return new Date(event.event_date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [event?.event_date]);

  const currentUserStatus = useMemo(() => {
    if (!user || !event?.attendees?.length) return undefined;
    return event.attendees.find(a => a.userId === user.id)?.status;
  }, [event?.attendees, user?.id]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await eventService.getEventById(id);
        setEvent(data);
      } catch (e) {
        console.error('Error loading event:', e);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleRsvp = async (status: EventAttendee['status']) => {
    if (!user) {
      showAlert('Error', 'Please sign in to RSVP');
      return;
    }

    if (!event) {
      showAlert('Error', 'Event not available');
      return;
    }

    try {
      setRsvpLoading(true);
      await eventService.rsvpEvent(event.id, user.id, status);
      const refreshed = await eventService.getEventById(event.id);
      setEvent(refreshed);
    } catch (e: any) {
      console.error('Error updating RSVP:', e);
      showAlert('Error', e?.message || 'Failed to update RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !event ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="event-busy" size={56} color={colors.border} />
          <Text style={styles.emptyText}>Event not found</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.title}>{event.title}</Text>

            {!!event.event_type && (
              <View style={styles.row}>
                <MaterialIcons name="category" size={18} color={colors.textSecondary} />
                <Text style={styles.value}>{event.event_type}</Text>
              </View>
            )}

            <View style={styles.row}>
              <MaterialIcons name="calendar-today" size={18} color={colors.textSecondary} />
              <Text style={styles.value}>{formattedDate}</Text>
            </View>

            <View style={styles.row}>
              <MaterialIcons name="access-time" size={18} color={colors.textSecondary} />
              <Text style={styles.value}>{formattedTime}</Text>
            </View>

            {!!event.location && (
              <View style={styles.row}>
                <MaterialIcons name="place" size={18} color={colors.textSecondary} />
                <Text style={styles.value}>{event.location}</Text>
              </View>
            )}
          </View>

          {!!event.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.bodyText}>{event.description}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your RSVP</Text>
            <View style={styles.rsvpRow}>
              <Pressable
                style={[
                  styles.rsvpButton,
                  currentUserStatus === 'going' && styles.rsvpGoing,
                ]}
                onPress={() => handleRsvp('going')}
                disabled={rsvpLoading}
              >
                <MaterialIcons name="check-circle" size={18} color={colors.success} />
                <Text
                  style={[
                    styles.rsvpLabel,
                    currentUserStatus === 'going' && styles.rsvpLabelActive,
                  ]}
                >
                  Going
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.rsvpButton,
                  currentUserStatus === 'maybe' && styles.rsvpMaybe,
                ]}
                onPress={() => handleRsvp('maybe')}
                disabled={rsvpLoading}
              >
                <MaterialIcons name="help" size={18} color={colors.warning} />
                <Text
                  style={[
                    styles.rsvpLabel,
                    currentUserStatus === 'maybe' && styles.rsvpLabelActive,
                  ]}
                >
                  Maybe
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.rsvpButton,
                  currentUserStatus === 'not_going' && styles.rsvpNotGoing,
                ]}
                onPress={() => handleRsvp('not_going')}
                disabled={rsvpLoading}
              >
                <MaterialIcons name="cancel" size={18} color={colors.error} />
                <Text
                  style={[
                    styles.rsvpLabel,
                    currentUserStatus === 'not_going' && styles.rsvpLabelActive,
                  ]}
                >
                  Not Going
                </Text>
              </Pressable>
            </View>
            {rsvpLoading ? (
              <View style={styles.rsvpLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : currentUserStatus ? (
              <Text style={styles.rsvpHint}>You are marked as {currentUserStatus}.</Text>
            ) : (
              <Text style={styles.bodyText}>Let the family know if you can make it.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attendees</Text>
            {event.attendees?.length ? (
              event.attendees.map(a => (
                <View key={`${a.userId}-${a.status}`} style={styles.attendeeRow}>
                  <Text style={styles.attendeeName}>{a.userName || 'Member'}</Text>
                  <Text style={styles.attendeeStatus}>{a.status}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.bodyText}>No RSVPs yet.</Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    marginLeft: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  bodyText: {
    fontSize: typography.sizes.base,
    color: colors.text,
    lineHeight: 22,
  },
  attendeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  attendeeName: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  attendeeStatus: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  rsvpRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rsvpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },
  rsvpGoing: {
    borderColor: colors.success,
    backgroundColor: `${colors.success}1A`,
  },
  rsvpMaybe: {
    borderColor: colors.warning,
    backgroundColor: `${colors.warning}1A`,
  },
  rsvpNotGoing: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}1A`,
  },
  rsvpLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  rsvpLabelActive: {
    color: colors.text,
  },
  rsvpHint: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  rsvpLoading: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  }
});   