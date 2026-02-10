/**
 * Relasjonelle tester for Supabase database
 * 
 * Tester relasjonene mellom tabeller:
 * - Cascading delete: sletting av event sletter også registreringer
 * - Cascading delete: sletting av profile sletter også registreringer
 * - Join queries: henting av event med tilknyttede registreringer
 * - Referanseintegritet: data som er koblet sammen forblir konsistent
 * 
 * Generert av KI
 */

import { describe, test, expect, afterEach } from 'vitest';
import { createClient } from '@/lib/supabase/client';
import { testConfig } from './setup';

describe('Database Relationships', () => {
  const supabase = createClient();
  let createdEventIds: string[] = [];
  let createdUserIds: string[] = [];

  afterEach(async () => {
    // Rydde opp registreringer først
    for (const eventId of createdEventIds) {
      await supabase.from('event_registrations').delete().eq('event_id', eventId);
    }
    for (const userId of createdUserIds) {
      await supabase.from('event_registrations').delete().eq('user_id', userId);
    }

    // Deretter events og users
    for (const eventId of createdEventIds) {
      await supabase.from('events').delete().eq('id', eventId);
    }
    for (const userId of createdUserIds) {
      await supabase.from('profiles').delete().eq('id', userId);
    }

    createdEventIds = [];
    createdUserIds = [];
  });

  describe('Cascading Delete - Events', () => {
    test('should cascade delete registrations when event is deleted', async () => {
      // Opprett event
      const { data: event } = await supabase
        .from('events')
        .insert({ title: 'Event to Delete' })
        .select()
        .single();

      createdEventIds.push(event.id);

      // Opprett bruker
      const userId = crypto.randomUUID();
      await supabase.from('profiles').insert({ id: userId, role: 'user' });
      createdUserIds.push(userId);

      // Registrer bruker for event
      const { data: registration } = await supabase
        .from('event_registrations')
        .insert({ event_id: event.id, user_id: userId })
        .select()
        .single();

      expect(registration).toBeDefined();

      // Slett eventet
      await supabase.from('events').delete().eq('id', event.id);

      // Sjekk at registreringen ble slettet
      const { data: remaining } = await supabase
        .from('event_registrations')
        .select()
        .eq('event_id', event.id);

      expect(remaining.length).toBe(0);
      
      // Fjern fra cleanup siden det er allerede slettet
      createdEventIds = createdEventIds.filter(id => id !== event.id);
    }, testConfig.timeout);
  });

  describe('Cascading Delete - Profiles', () => {
    test('should cascade delete registrations when user profile is deleted', async () => {
      // Opprett event
      const { data: event } = await supabase
        .from('events')
        .insert({ title: 'Event with User' })
        .select()
        .single();

      createdEventIds.push(event.id);

      // Opprett bruker
      const userId = crypto.randomUUID();
      await supabase.from('profiles').insert({ id: userId, role: 'user' });
      createdUserIds.push(userId);

      // Registrer bruker for event
      const { data: registration } = await supabase
        .from('event_registrations')
        .insert({ event_id: event.id, user_id: userId })
        .select()
        .single();

      expect(registration).toBeDefined();

      // Slett profilen
      await supabase.from('profiles').delete().eq('id', userId);

      // Sjekk at registreringen ble slettet
      const { data: remaining } = await supabase
        .from('event_registrations')
        .select()
        .eq('user_id', userId);

      expect(remaining.length).toBe(0);

      // Fjern fra cleanup siden det er allerede slettet
      createdUserIds = createdUserIds.filter(id => id !== userId);
    }, testConfig.timeout);
  });

  describe('Join Queries', () => {
    test('should fetch event with all registrations', async () => {
      // Opprett event
      const { data: event } = await supabase
        .from('events')
        .insert({ title: 'Popular Event' })
        .select()
        .single();

      createdEventIds.push(event.id);

      // Opprett 3 brukere og registrer dem
      for (let i = 0; i < 3; i++) {
        const userId = crypto.randomUUID();
        await supabase.from('profiles').insert({ id: userId, role: 'user' });
        createdUserIds.push(userId);

        await supabase.from('event_registrations').insert({
          event_id: event.id,
          user_id: userId,
        });
      }

      // Hent event med alle registreringer
      const { data: registrations, error } = await supabase
        .from('event_registrations')
        .select('*, events(title)')
        .eq('event_id', event.id);

      expect(error).toBeNull();
      expect(registrations.length).toBe(3);
      expect(registrations[0].events.title).toBe('Popular Event');
    }, testConfig.timeout);

    test('should fetch registrations with user details', async () => {
      // Opprett event
      const { data: event } = await supabase
        .from('events')
        .insert({ title: 'Event with Users' })
        .select()
        .single();

      createdEventIds.push(event.id);

      // Opprett brukere
      const userIds = [];
      for (let i = 0; i < 2; i++) {
        const userId = crypto.randomUUID();
        await supabase.from('profiles').insert({ id: userId, role: 'user' });
        createdUserIds.push(userId);
        userIds.push(userId);

        await supabase.from('event_registrations').insert({
          event_id: event.id,
          user_id: userId,
        });
      }

      // Hent registreringer med brukerdetaljer
      const { data: registrations, error } = await supabase
        .from('event_registrations')
        .select('user_id, profiles(id, role)')
        .eq('event_id', event.id);

      expect(error).toBeNull();
      expect(registrations.length).toBe(2);
      expect(registrations[0].profiles).toBeDefined();
      expect(registrations[0].profiles.role).toBe('user');
    }, testConfig.timeout);

    test('should fetch users registrations with event details', async () => {
      // Opprett bruker
      const userId = crypto.randomUUID();
      await supabase.from('profiles').insert({ id: userId, role: 'user' });
      createdUserIds.push(userId);

      // Opprett 2 events og registrer bruker
      for (let i = 0; i < 2; i++) {
        const { data: event } = await supabase
          .from('events')
          .insert({ title: `Event ${i + 1}` })
          .select()
          .single();

        createdEventIds.push(event.id);

        await supabase.from('event_registrations').insert({
          event_id: event.id,
          user_id: userId,
        });
      }

      // Hent brukers registreringer med event detaljer
      const { data: registrations, error } = await supabase
        .from('event_registrations')
        .select('*, events(id, title)')
        .eq('user_id', userId);

      expect(error).toBeNull();
      expect(registrations.length).toBe(2);
      expect(registrations[0].events.title).toBe('Event 1');
      expect(registrations[1].events.title).toBe('Event 2');
    }, testConfig.timeout);
  });

  describe('Referential Integrity', () => {
    test('should maintain integrity when updating event', async () => {
      // Opprett event
      const { data: event } = await supabase
        .from('events')
        .insert({ title: 'Original Title' })
        .select()
        .single();

      createdEventIds.push(event.id);

      // Opprett bruker og registrering
      const userId = crypto.randomUUID();
      await supabase.from('profiles').insert({ id: userId, role: 'user' });
      createdUserIds.push(userId);

      await supabase.from('event_registrations').insert({
        event_id: event.id,
        user_id: userId,
      });

      // Oppdater event
      const { data: updated } = await supabase
        .from('events')
        .update({ title: 'Updated Title' })
        .eq('id', event.id)
        .select()
        .single();

      // Sjekk at registreringen fortsatt peker til event
      const { data: registration } = await supabase
        .from('event_registrations')
        .select('*, events(title)')
        .eq('event_id', event.id)
        .single();

      expect(registration.events.title).toBe('Updated Title');
      expect(updated.title).toBe('Updated Title');
    }, testConfig.timeout);

    test('should maintain integrity when updating user profile', async () => {
      // Opprett event
      const { data: event } = await supabase
        .from('events')
        .insert({ title: 'Test Event' })
        .select()
        .single();

      createdEventIds.push(event.id);

      // Opprett bruker
      const userId = crypto.randomUUID();
      await supabase.from('profiles').insert({ id: userId, role: 'user' });
      createdUserIds.push(userId);

      // Registrer bruker
      await supabase.from('event_registrations').insert({
        event_id: event.id,
        user_id: userId,
      });

      // Oppdater brukerprofil
      const { data: updated } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)
        .select()
        .single();

      // Sjekk at registreringen fortsatt peker til bruker
      const { data: registration } = await supabase
        .from('event_registrations')
        .select('*, profiles(role)')
        .eq('user_id', userId)
        .single();

      expect(registration.profiles.role).toBe('admin');
      expect(updated.role).toBe('admin');
    }, testConfig.timeout);
  });
});