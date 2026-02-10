import { createClient } from './client';
import { events, event_registration, job_posting, profiles, create_event_input, create_job_input } from './types';

const supabase = createClient();


export async function createEvent(data: create_event_input): Promise<events> {
  const { data: event, error } = await supabase.from('events').insert(data).select().single();
  if (error) throw error;
  return event as events;
}

export async function getEvents(): Promise<events[]> {
  const { data: events, error } = await supabase.from('events').select();
  if (error) throw error;
  return events as events[];
}

export async function registerForEvent(eventId: string, userId: string): Promise<event_registration> {
  throw new Error("Not implemented");
}

export async function createJobPosting(data: create_job_input): Promise<job_posting> {
  throw new Error("Not implemented");
}

export async function getJobPostings(): Promise<job_posting[]> {
  throw new Error("Not implemented");
}


