/**
 * Integration tests for Supabase database CRUD operations
 *
 * This file tests all Create, Read, Update, Delete operations
 * for the tables: events, job_postings, profiles and event_registrations.
 * Tests verify that the database functions correctly and handles relations
 * between tables. Each test automatically cleans up after itself.
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { createClient } from "@/lib/supabase/client";
import {
  mockEvent,
  mockJobPosting,
  mockProfile,
  testConfig,
  createTestEvent,
} from "./setup";

describe("Database CRUD Operations", () => {
  const supabase = createClient();
  let createdEventId: string | null = null;
  let createdJobId: string | null = null;
  let createdUserId: string | null = null;

  // Rydde opp etter hver test
  afterEach(async () => {
    if (createdEventId) {
      await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", createdEventId);
      await supabase.from("events").delete().eq("id", createdEventId);
      createdEventId = null;
    }

    if (createdJobId) {
      await supabase.from("job_postings").delete().eq("id", createdJobId);
      createdJobId = null;
    }
    if (createdUserId) {
      await supabase.from("profiles").delete().eq("id", createdUserId);
      createdUserId = null;
    }
  });

  describe("Arrangement (Events) Operations", () => {
    test(
      "should create a new event",
      async () => {
        const { data, error } = await supabase
          .from("events")
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
      },
      testConfig.timeout,
    );

    test(
      "should fetch all events",
      async () => {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("created_at", { ascending: false });

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(Array.isArray(data)).toBe(true);
      },
      testConfig.timeout,
    );

    test(
      "should update an event",
      async () => {
        // Først opprett et event
        const { data: newEvent } = await supabase
          .from("events")
          .insert(mockEvent)
          .select()
          .single();

        createdEventId = newEvent.id;

        // Så oppdater det
        const updatedTitle = "Oppdatert Event Tittel";
        const { data, error } = await supabase
          .from("events")
          .update({ title: updatedTitle })
          .eq("id", createdEventId)
          .select()
          .single();

        expect(error).toBeNull();
        expect(data.title).toBe(updatedTitle);
      },
      testConfig.timeout,
    );

    test(
      "should delete an event",
      async () => {
        // Først opprett et event
        const { data: newEvent } = await supabase
          .from("events")
          .insert(mockEvent)
          .select()
          .single();

        // Så slett det
        const { error } = await supabase
          .from("events")
          .delete()
          .eq("id", newEvent.id);

        expect(error).toBeNull();

        // Sjekk at det er slettet
        const { data: deletedEvent } = await supabase
          .from("events")
          .select()
          .eq("id", newEvent.id)
          .single();

        expect(deletedEvent).toBeNull();
      },
      testConfig.timeout,
    );
  });

  describe("Jobb Operasjoner (Job Postings)", () => {
    test(
      "should create a new job posting",
      async () => {
        const { data, error } = await supabase
          .from("job_postings")
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
      },
      testConfig.timeout,
    );

    test(
      "should fetch all job postings",
      async () => {
        const { data, error } = await supabase
          .from("job_postings")
          .select("*")
          .order("created_at", { ascending: false });

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(Array.isArray(data)).toBe(true);
      },
      testConfig.timeout,
    );

    test(
      "should update a job posting",
      async () => {
        // Først opprett en jobb
        const { data: newJob } = await supabase
          .from("job_postings")
          .insert(mockJobPosting)
          .select()
          .single();

        createdJobId = newJob.id;

        // Så oppdater den
        const updatedCompany = "Ny Bedrift AS";
        const { data, error } = await supabase
          .from("job_postings")
          .update({ company: updatedCompany })
          .eq("id", createdJobId)
          .select()
          .single();

        expect(error).toBeNull();
        expect(data.company).toBe(updatedCompany);
      },
      testConfig.timeout,
    );
  });

  describe("Bruker Profil Operasjoner", () => {
    test(
      "should return error when creating profile with non-existent user id",
      async () => {
        // Profiler har foreign key constraint til auth.users
        // Derfor kan vi ikke lage profiler med random UUIDs
        const testUserId = crypto.randomUUID();

        const { error } = await supabase
          .from("profiles")
          .insert({
            id: testUserId,
            role: mockProfile.role,
          })
          .select()
          .single();

        // Skal få feil pga foreign key constraint
        expect(error).not.toBeNull();
      },
      testConfig.timeout,
    );

    test(
      "should fetch user profiles",
      async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .limit(10);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(Array.isArray(data)).toBe(true);
      },
      testConfig.timeout,
    );
  });

  describe("Event Registrering Operasjoner", () => {
    test(
      "should not register user for event without valid profile",
      async () => {
        // Først opprett et event
        const { data: event } = await supabase
          .from("events")
          .insert(createTestEvent("Test Event for Registration"))
          .select()
          .single();

        createdEventId = event.id;

        // Prøv å registrere med random user ID (bryter foreign key)
        const testUserId = crypto.randomUUID();
        const { error } = await supabase
          .from("event_registrations")
          .insert({
            event_id: event.id,
            user_id: testUserId,
          })
          .select()
          .single();

        // Skal få feil pga foreign key constraint
        expect(error).not.toBeNull();
      },
      testConfig.timeout,
    );

    test(
      "should get all registrations for an event",
      async () => {
        const { data, error } = await supabase
          .from("event_registrations")
          .select("*, events(title), profiles(role)")
          .limit(5);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(Array.isArray(data)).toBe(true);
      },
      testConfig.timeout,
    );
  });
});
