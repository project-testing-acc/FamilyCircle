// Event Service - Event management operations
import { getSupabaseClient } from '@/template';
import type { Event, EventAttendee } from '@/types';

type RSVPStatus = EventAttendee['status'];

function mapDbEventToEvent(db: any): Event {
  return {
    id: db.id,
    familyId: db.family_id,
    title: db.title,
    description: db.description ?? undefined,
    event_type: db.event_type ?? undefined,
    event_date: db.event_date,
    location: db.location ?? undefined,
    createdBy: db.created_by,
    createdAt: db.created_at,
    updatedAt: db.updated_at ?? undefined,
    reminderSet: false,
    attendees: (db.rsvps ?? []).map(
      (a: any): EventAttendee => ({
        userId: a.user_id,
        userName: a.user?.username ?? '',
        status: a.status,
      })
    ),
    chatId: db.chat_id ?? undefined,
  };
}

export const eventService = {
  async getEvents(familyId: string): Promise<Event[]> {
    const supabase = getSupabaseClient();
    console.log('Getting events for family:', familyId);

    const { data, error } = await supabase
      .from('events')
      .select(
        `
        *,
        rsvps:event_rsvps (
          user_id,
          status,
          user:user_profiles ( username )
        )
      `
      )
      .eq('family_id', familyId)
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Get events error:', error);
      throw error;
    }

    console.log('Events loaded:', data?.length ?? 0);
    return (data ?? []).map(mapDbEventToEvent);
  },

  async getEventById(eventId: string): Promise<Event> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('events')
      .select(
        `
        *,
        rsvps:event_rsvps (
          user_id,
          status,
          user:user_profiles ( username )
        )
      `
      )
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Get event by ID error:', error);
      throw error;
    }
    console.log('data',data);
    

    return mapDbEventToEvent(data);
  },

  async createEvent(input: {
    family_id: string;
    title: string;
    description?: string;
    event_type?: string;
    event_date: string;
    location?: string;
    created_by: string;
    created_at: string;
  }): Promise<Event> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('events')
      .insert({
        family_id: input.family_id,
        title: input.title,
        description: input.description ?? null,
        event_type: input.event_type ?? null,
        event_date: input.event_date,
        location: input.location ?? null,
        created_by: input.created_by,
      })
      .select(
        `
        *,
        rsvps:event_rsvps (
          user_id,
          status,
          user:user_profiles ( username )
        )
      `
      )
      .single();

    if (error) {
      console.error('Create event error:', error);
      throw error;
    }

    return mapDbEventToEvent(data);
  },

  async updateEvent(
    eventId: string,
    updates: Partial<Pick<Event, 'title' | 'description' | 'event_date' | 'location' | 'event_type'>>
  ): Promise<Event> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('events')
      .update({
        title: updates.title,
        description: updates.description,
        event_date: updates.event_date,
        location: updates.location,
        event_type: updates.event_type,
      })
      .eq('id', eventId)
      .select(
        `
        *,
        rsvps:event_rsvps (
          user_id,
          status,
          user:user_profiles ( username )
        )
      `
      )
      .single();

    if (error) {
      console.error('Update event error:', error);
      throw error;
    }

    return mapDbEventToEvent(data);
  },

  async deleteEvent(eventId: string): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from('events').delete().eq('id', eventId);

    if (error) {
      console.error('Delete event error:', error);
      throw error;
    }
  },

  async rsvpEvent(eventId: string, userId: string, status: RSVPStatus): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('event_rsvps')
      .upsert({
        event_id: eventId,
        user_id: userId,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error('RSVP event error:', error);
      throw error;
    }
  },
};
