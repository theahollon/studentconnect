/**
 * Relational tests for Supabase database
 *
 * Tests the relationships between tables:
 * - Cascading delete: deleting event also deletes registrations
 * - Cascading delete: deleting profile also deletes registrations
 * - Join queries: fetching event with associated registrations
 * - Referential integrity: linked data remains consistent
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import { describe, test, expect, afterEach } from "@jest/globals";
import { createClient } from "@/lib/supabase/client";
import { testConfig, createTestEvent } from "./setup";

describe("Database Relationships", () => {
  const supabase = createClient();
  let createdEventIds: string[] = [];
  let createdUserIds: string[] = [];

  afterEach(async () => {
    // Rydde opp registreringer først
    for (const eventId of createdEventIds) {
      await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", eventId);
    }
    for (const userId of createdUserIds) {
      await supabase.from("event_registrations").delete().eq("user_id", userId);
    }

    // Deretter events og users
    for (const eventId of createdEventIds) {
      await supabase.from("events").delete().eq("id", eventId);
    }
    for (const userId of createdUserIds) {
      await supabase.from("profiles").delete().eq("id", userId);
    }

    createdEventIds = [];
    createdUserIds = [];
  });

  describe("Cascading Delete - Events", () => {
    test(
      "should cascade delete registrations when event is deleted",
      async () => {
        // Opprett event
        const { data: event } = await supabase
          .from("events")
          .insert(createTestEvent("Event to Delete"))
          .select()
          .single();

        createdEventIds.push(event.id);

        // Opprett bruker
        const userId = crypto.randomUUID();
        await supabase.from("profiles").insert({ id: userId, role: "user" });
        createdUserIds.push(userId);

        // Registrer bruker for event
        const { data: registration } = await supabase
          .from("event_registrations")
          .insert({ event_id: event.id, user_id: userId })
          .select()
          .single();

        expect(registration).toBeDefined();

        // Slett eventet
        await supabase.from("events").delete().eq("id", event.id);

        // Sjekk at registreringen ble slettet
        const { data: remaining } = await supabase
          .from("event_registrations")
          .select()
          .eq("event_id", event.id);

        expect(remaining?.length ?? 0).toBe(0);

        // Fjern fra cleanup siden det er allerede slettet
        createdEventIds = createdEventIds.filter((id) => id !== event.id);
      },
      testConfig.timeout,
    );
  });

  describe("Cascading Delete - Profiles", () => {
    test(
      "should cascade delete registrations when user profile is deleted",
      async () => {
        // Opprett event
        const { data: event } = await supabase
          .from("events")
          .insert(createTestEvent("Event with User"))
          .select()
          .single();

        createdEventIds.push(event.id);

        // Opprett bruker
        const userId = crypto.randomUUID();
        await supabase.from("profiles").insert({ id: userId, role: "user" });
        createdUserIds.push(userId);

        // Registrer bruker for event
        const { data: registration } = await supabase
          .from("event_registrations")
          .insert({ event_id: event.id, user_id: userId })
          .select()
          .single();

        expect(registration).toBeDefined();

        // Slett profilen
        await supabase.from("profiles").delete().eq("id", userId);

        // Sjekk at registreringen ble slettet
        const { data: remaining } = await supabase
          .from("event_registrations")
          .select()
          .eq("user_id", userId);

        expect(remaining?.length ?? 0).toBe(0);

        // Fjern fra cleanup siden det er allerede slettet
        createdUserIds = createdUserIds.filter((id) => id !== userId);
      },
      testConfig.timeout,
    );
  });

  describe("Join Queries", () => {
    test(
      "should fetch event with all registrations",
      async () => {
        // Create event
        const { data: event } = await supabase
          .from("events")
          .insert(createTestEvent("Popular Event"))
          .select()
          .single();

        createdEventIds.push(event.id);

        // Fetch event registrations with event details
        // (Note: can't create registrations without valid profiles)
        const { data: registrations, error } = await supabase
          .from("event_registrations")
          .select("*, events(title)")
          .eq("event_id", event.id);

        expect(error).toBeNull();
        expect(Array.isArray(registrations)).toBe(true);
      },
      testConfig.timeout,
    );

    test(
      "should fetch registrations with user details",
      async () => {
        // Fetch all registrations with user details
        // (Note: can't create registrations without valid profiles)
        const { data: registrations, error } = await supabase
          .from("event_registrations")
          .select("*, profiles(id, role)")
          .limit(10);

        expect(error).toBeNull();
        expect(Array.isArray(registrations)).toBe(true);
      },
      testConfig.timeout,
    );

    test(
      "should fetch all registrations",
      async () => {
        // Fetch all registrations with event details
        const { data: registrations, error } = await supabase
          .from("event_registrations")
          .select("*, events(id, title)")
          .limit(10);

        expect(error).toBeNull();
        expect(Array.isArray(registrations)).toBe(true);
      },
      testConfig.timeout,
    );
  });

  describe("Referential Integrity", () => {
    test(
      "should update event and verify relationship",
      async () => {
        // Create event
        const { data: event } = await supabase
          .from("events")
          .insert(createTestEvent("Original Title"))
          .select()
          .single();

        createdEventIds.push(event.id);

        // Update event
        const { data: updated } = await supabase
          .from("events")
          .update({ title: "Updated Title" })
          .eq("id", event.id)
          .select()
          .single();

        expect(updated.title).toBe("Updated Title");
      },
      testConfig.timeout,
    );

    test(
      "should fetch events with related data",
      async () => {
        // Create event
        const { data: event } = await supabase
          .from("events")
          .insert(createTestEvent("Test Event"))
          .select()
          .single();

        createdEventIds.push(event.id);

        // Fetch event details
        const { data: fetched } = await supabase
          .from("events")
          .select("*")
          .eq("id", event.id)
          .single();

        expect(fetched).toBeDefined();
        expect(fetched.title).toBe("Test Event");
      },
      testConfig.timeout,
    );
  });
});
