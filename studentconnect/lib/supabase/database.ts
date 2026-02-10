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
    const { data: registration, error } = await supabase.from('event_registration').insert({
        event_id: eventId,
        user_id: userId
    }).select().single();
    if (error) throw error;
    return registration as event_registration;
}

export async function createJobPosting(data: create_job_input): Promise<job_posting> {
  const { data: job, error } = await supabase.from('job_posting').insert(data).select().single();
  if (error) throw error;
  return job as job_posting;
}

export async function getJobPostings(): Promise<job_posting[]> {
    const { data: jobs, error } = await supabase.from('job_posting').select();
    if (error) throw error;
    return jobs as job_posting[];
}


