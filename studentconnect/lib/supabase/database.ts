import { createClient } from './client';
import { events, event_registration, job_posting, profiles, create_event_input, create_job_input } from './types';

const supabase = createClient();


export async function createEvent(data: create_event_input): Promise<events> {
  throw new Error("Not implemented");
}

export async function getEvents(): Promise<events[]> {
  throw new Error("Not implemented");
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


