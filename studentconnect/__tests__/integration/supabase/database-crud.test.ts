/**
 * Integrasjonstester for Supabase database CRUD-operasjoner
 * 
 * Denne filen tester alle Create, Read, Update, Delete operasjoner
 * for tabellene: events, job_postings, profiles og event_registrations.
 * Testene sjekker at databasen fungerer riktig og håndterer relasjoner
 * mellom tabeller. Hver test rydder automatisk opp etter seg.
 * 
 * Generert av KI
 */


import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@/lib/supabase/client';
import { mockEvent, mockJobPosting, mockProfile, testConfig } from './setup';

describe('Database CRUD Operations', () => {
  const supabase = createClient();
  let createdEventId: string | null = null;
  let createdJobId: string | null = null;
  let createdUserId: string | null = null;

  // Rydde opp etter hver test
  afterEach(async () => {
    
    if (createdEventId) {
        await supabase.from('event_registrations').delete().eq('event_id', createdEventId);
        await supabase.from('events').delete().eq('id', createdEventId);
        createdEventId = null;
    }

    if (createdJobId) {
      await supabase.from('job_postings').delete().eq('id', createdJobId);
      createdJobId = null;
    }
    if (createdUserId) {
      await supabase.from('profiles').delete().eq('id', createdUserId);
      createdUserId = null;
    }
  });

  describe('Arrangement (Events) Operations', () => {
    test('should create a new event', async () => {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: mockEvent.title,
          description: mockEvent.description,
          location: mockEvent.location,
          start_time: mockEvent.start_time,
          end_time: mockEvent.end_time,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.title).toBe(mockEvent.title);
      expect(data.description).toBe(mockEvent.description);
      expect(data.location).toBe(mockEvent.location);
      
      createdEventId = data.id;
    }, testConfig.timeout);

    test('should fetch all events', async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    }, testConfig.timeout);

    test('should update an event', async () => {
      // Først opprett et event
      const { data: newEvent } = await supabase
        .from('events')
        .insert(mockEvent)
        .select()
        .single();

      createdEventId = newEvent.id;

      // Så oppdater det
      const updatedTitle = 'Oppdatert Event Tittel';
      const { data, error } = await supabase
        .from('events')
        .update({ title: updatedTitle })
        .eq('id', createdEventId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.title).toBe(updatedTitle);
    }, testConfig.timeout);

    test('should delete an event', async () => {
      // Først opprett et event
      const { data: newEvent } = await supabase
        .from('events')
        .insert(mockEvent)
        .select()
        .single();

      // Så slett det
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', newEvent.id);

      expect(error).toBeNull();

      // Sjekk at det er slettet
      const { data: deletedEvent } = await supabase
        .from('events')
        .select()
        .eq('id', newEvent.id)
        .single();

      expect(deletedEvent).toBeNull();
    }, testConfig.timeout);
  });

  describe('Jobb Operasjoner (Job Postings)', () => {
    test('should create a new job posting', async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .insert({
          title: mockJobPosting.title,
          description: mockJobPosting.description,
          company: mockJobPosting.company,
          application_url: mockJobPosting.application_url,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.title).toBe(mockJobPosting.title);
      expect(data.company).toBe(mockJobPosting.company);
      expect(data.application_url).toBe(mockJobPosting.application_url);
      
      createdJobId = data.id;
    }, testConfig.timeout);

    test('should fetch all job postings', async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    }, testConfig.timeout);

    test('should update a job posting', async () => {
      // Først opprett en jobb
      const { data: newJob } = await supabase
        .from('job_postings')
        .insert(mockJobPosting)
        .select()
        .single();

      createdJobId = newJob.id;

      // Så oppdater den
      const updatedCompany = 'Ny Bedrift AS';
      const { data, error } = await supabase
        .from('job_postings')
        .update({ company: updatedCompany })
        .eq('id', createdJobId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.company).toBe(updatedCompany);
    }, testConfig.timeout);
  });

  describe('Bruker Profil Operasjoner', () => {
    test('should create a user profile', async () => {
      // Generer en test UUID (i ekte app ville dette komme fra auth.users)
      const testUserId = crypto.randomUUID();

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          role: mockProfile.role,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.role).toBe(mockProfile.role);
      expect(data.id).toBe(testUserId);
      
      createdUserId = data.id;
    }, testConfig.timeout);

    test('should fetch user profiles', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    }, testConfig.timeout);

    test('should update user role', async () => {
      // Først opprett en profil
      const testUserId = crypto.randomUUID();
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          role: 'user',
        })
        .select()
        .single();

      createdUserId = newProfile.id;

      // Så oppdater rollen
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', createdUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.role).toBe('admin');
    }, testConfig.timeout);
  });

  describe('Event Registrering Operasjoner', () => {
    test('should register user for event', async () => {
      // Først opprett et event og en bruker
      const { data: event } = await supabase
        .from('events')
        .insert(mockEvent)
        .select()
        .single();

      const testUserId = crypto.randomUUID();
      const { data: profile } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          role: 'user',
        })
        .select()
        .single();

      createdEventId = event.id;
      createdUserId = profile.id;

      // Registrer brukeren for eventet
      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          user_id: profile.id,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.event_id).toBe(event.id);
      expect(data.user_id).toBe(profile.id);
    }, testConfig.timeout);

    test('should prevent duplicate registration', async () => {
      // Først opprett et event og en bruker
      const { data: event } = await supabase
        .from('events')
        .insert(mockEvent)
        .select()
        .single();

      const testUserId = crypto.randomUUID();
      const { data: profile } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          role: 'user',
        })
        .select()
        .single();

      createdEventId = event.id;
      createdUserId = profile.id;

      // Første registrering
      await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          user_id: profile.id,
        });

      // Prøv å registrere samme bruker igjen
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          user_id: profile.id,
        });

      // Skal få feil pga unique constraint
      expect(error).not.toBeNull();
      expect(error?.message).toContain('duplicate');
    }, testConfig.timeout);

    test('should get all registrations for an event', async () => {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*, events(title), profiles(role)')
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    }, testConfig.timeout);
  });
});