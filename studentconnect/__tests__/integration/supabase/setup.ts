/**
 * Setup-fil for Supabase integrasjonstester
 * 
 * Denne filen setter opp felles konfigurasjon og mock-data som brukes 
 * på tvers av alle Supabase-tester. Den sjekker miljøvariabler, 
 * definerer timeout-innstillinger og gir testdata for events, 
 * jobboppslag og brukerprofiler.
 * 
 * Generert av KI, (ved hjelp av KI)
 */

import { beforeAll, afterAll } from '@jest/globals';

// Mock miljøvariabler for testing
beforeAll(() => {
  // Sjekk at miljøvariabler er satt
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL ikke satt - bruker mock verdi');
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY ikke satt - bruker mock verdi');
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
  }

  console.log('Supabase test oppsett fullført');
});

afterAll(() => {
  // Rydde opp etter alle tester er ferdig
  console.log('Supabase test opprydding fullført');
});

// Hjelpefunksjoner for testing
export const testConfig = {
  timeout: 10000, // 10 sekunder timeout for database operasjoner
  retries: 3,     // Antall forsøk hvis test feiler
};

// Mock data basert på din database-struktur
export const mockEvent = {
  title: 'Test Event',
  description: 'Test beskrivelse for integrasjonstesting',
  location: 'Test Lokasjon',
  start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // I morgen
  end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // I morgen + 1 time
};

export const mockJobPosting = {
  title: 'Test Utvikler Jobb',
  description: 'Test jobbeskrivelse for integrasjonstesting',
  company: 'Test Company AS',
  application_url: 'https://test-company.no/apply',
};

export const mockProfile = {
  role: 'user' as const,
};

// Test bruker for autentisering
export const testUser = {
  email: 'test@student-connect.no',
  password: 'testpassword123',
};