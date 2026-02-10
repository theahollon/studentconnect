/**
 * Constraints og validering-tester for Supabase database
 * 
 * Tester at databasen håndterer constraints riktig:
 * - Events: title er påkrevd, resten kan komme senere
 * - Job Postings: title, company, application_url er påkrevd
 * - Profiles: id og role er påkrevd
 * - Event Registrations: event_id og user_id må eksistere, ingen duplisering
 * 
 * Generert av KI
 */

import { describe, test, expect, afterEach } from '@jest/globals';
import { createClient } from '@/lib/supabase/client';
import { mockEvent, mockJobPosting, mockProfile, testConfig } from './setup';

describe('Database Constraints', () => {
  const supabase = createClient();
  let createdEventIds: string[] = [];
  let createdJobIds: string[] = [];
  let createdUserIds: string[] = [];

  afterEach(async () => {
    // Rydde opp etter hver test
    for (const eventId of createdEventIds) {
      await supabase.from('event_registrations').delete().eq('event_id', eventId);
      await supabase.from('events').delete().eq('id', eventId);
    }
    for (const jobId of createdJobIds) {
      await supabase.from('job_postings').delete().eq('id', jobId);
    }
    for (const userId of createdUserIds) {
      await supabase.from('profiles').delete().eq('id', userId);
    }
    createdEventIds = [];
    createdJobIds = [];
    createdUserIds = [];
  });

  describe('Event Constraints', () => {
    test('should reject event without title', async () => {
      const { error } = await supabase
        .from('events')
        .insert({
          title: null,
          description: 'Test',
        })
        .select()
        .single();

      expect(error).not.toBeNull();
    }, testConfig.timeout);

    test('should create event with only title', async () => {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: 'Minimal Event',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.title).toBe('Minimal Event');
      if (data) createdEventIds.push(data.id);
    }, testConfig.timeout);
  });

  describe('Job Posting Constraints', () => {
    test('should reject job without title', async () => {
      const { error } = await supabase
        .from('job_postings')
        .insert({
          company: 'Test Co',
          application_url: 'https://test.no',
        })
        .select()
        .single();

      expect(error).not.toBeNull();
    }, testConfig.timeout);

    test('should reject job without company', async () => {
      const { error } = await supabase
        .from('job_postings')
        .insert({
          title: 'Developer',
          application_url: 'https://test.no',
        })
        .select()
        .single();

      expect(error).not.toBeNull();
    }, testConfig.timeout);

    test('should reject job without application_url', async () => {
      const { error } = await supabase
        .from('job_postings')
        .insert({
          title: 'Developer',
          company: 'Test Co',
        })
        .select()
        .single();

      expect(error).not.toBeNull();
    }, testConfig.timeout);

    test('should create valid job posting', async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .insert(mockJobPosting)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      if (data) createdJobIds.push(data.id);
    }, testConfig.timeout);
  });

  describe('Profile Constraints', () => {
    test('should reject profile without id', async () => {
      const { error } = await supabase
        .from('profiles')
        .insert({
          role: 'user',
        })
        .select()
        .single();

      expect(error).not.toBeNull();
    }, testConfig.timeout);

    test('should create profile with id and role', async () => {
      const userId = crypto.randomUUID();
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: 'user',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.id).toBe(userId);
      createdUserIds.push(userId);
    }, testConfig.timeout);
  });

  describe('Event Registration Constraints', () => {
    test('should reject registration with non-existent event', async () => {
      const userId = crypto.randomUUID();
      await supabase.from('profiles').insert({ id: userId, role: 'user' });
      createdUserIds.push(userId);

      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: '00000000-0000-0000-0000-000000000000',
          user_id: userId,
        })
        .select()
        .single();

      expect(error).not.toBeNull();
    }, testConfig.timeout);

    test('should reject registration with non-existent user', async () => {
      const { data: event } = await supabase
        .from('events')
        .insert({ title: 'Test Event' })
        .select()
        .single();

      createdEventIds.push(event.id);

      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          user_id: '00000000-0000-0000-0000-000000000000',
        })
        .select()
        .single();

      expect(error).not.toBeNull();
    }, testConfig.timeout);

    test('should prevent duplicate registration', async () => {
      const { data: event } = await supabase
        .from('events')
        .insert({ title: 'Test Event' })
        .select()
        .single();

      const userId = crypto.randomUUID();
      await supabase.from('profiles').insert({ id: userId, role: 'user' });

      createdEventIds.push(event.id);
      createdUserIds.push(userId);

      // Første registrering
      await supabase.from('event_registrations').insert({
        event_id: event.id,
        user_id: userId,
      });

      // Prøv å registrere igjen
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          user_id: userId,
        })
        .select()
        .single();

      expect(error).not.toBeNull();
    }, testConfig.timeout);

    test('should create valid registration', async () => {
      const { data: event } = await supabase
        .from('events')
        .insert({ title: 'Test Event' })
        .select()
        .single();

      const userId = crypto.randomUUID();
      await supabase.from('profiles').insert({ id: userId, role: 'user' });

      createdEventIds.push(event.id);
      createdUserIds.push(userId);

      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          user_id: userId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.event_id).toBe(event.id);
    }, testConfig.timeout);
  });
});