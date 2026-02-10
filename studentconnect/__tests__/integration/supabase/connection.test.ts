/**
 * Integrasjonstester for Supabase tilkobling
 * 
 * Disse testene sjekker at Supabase-klientene kan opprettes riktig,
 * miljøvariabler er satt, og at tilkobling til alle database-tabeller
 * fungerer som forventet. Grunnleggende testing av database-tilgang.
 * 
 * Generert av KI
 */



import { describe, test, expect } from '@jest/globals';
import { createClient } from '@/lib/supabase/client';
import { testConfig } from './setup';

describe('Supabase Configuration and Connection', () => {
  describe('Environment Variables', () => {
    test('should have NEXT_PUBLIC_SUPABASE_URL defined', () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      expect(url).toBeDefined();
      expect(url).not.toBe('');
      expect(url).toContain('supabase.co');
    });

    test('should have NEXT_PUBLIC_SUPABASE_ANON_KEY defined', () => {
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      expect(key).toBeDefined();
      expect(key).not.toBe('');
    });
  });

  describe('Supabase Client', () => {
    test('should create a Supabase client instance', () => {
      const client = createClient();
      expect(client).toBeDefined();
      expect(client).not.toBeNull();
    });

    test('should have database property on client', () => {
      const client = createClient();
      expect(client.from).toBeDefined();
      expect(typeof client.from).toBe('function');
    });
  });

  describe('Database Connection', () => {
    test('should connect to events table', async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from('events')
        .select('count', { count: 'exact', head: true });

      expect(error).toBeNull();
    }, testConfig.timeout);

    test('should connect to job_postings table', async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from('job_postings')
        .select('count', { count: 'exact', head: true });

      expect(error).toBeNull();
    }, testConfig.timeout);

    test('should connect to profiles table', async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });

      expect(error).toBeNull();
    }, testConfig.timeout);

    test('should connect to event_registrations table', async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from('event_registrations')
        .select('count', { count: 'exact', head: true });

      expect(error).toBeNull();
    }, testConfig.timeout);
  });

  describe('Table Structure', () => {
    test('should retrieve events with expected columns', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        expect(data[0]).toHaveProperty('id');
        expect(data[0]).toHaveProperty('title');
      }
    }, testConfig.timeout);

    test('should retrieve job_postings with expected columns', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        expect(data[0]).toHaveProperty('id');
        expect(data[0]).toHaveProperty('title');
      }
    }, testConfig.timeout);

    test('should retrieve profiles with expected columns', async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        expect(data[0]).toHaveProperty('id');
      }
    }, testConfig.timeout);
  });
});