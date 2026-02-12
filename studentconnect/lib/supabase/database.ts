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

// User Profile Functions
export async function getUserProfile(userId: string): Promise<profiles | null> {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', userId)
        .single();
    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
    return profile as profiles | null;
}

export async function updateUserProfile(userId: string, data: Partial<profiles>): Promise<profiles> {
    const { data: profile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
        .select()
        .single();
    if (error) throw error;
    return profile as profiles;
}

// Event Registration Functions
export async function getUserEventRegistrations(userId: string): Promise<event_registration[]> {
    const { data: registrations, error } = await supabase
        .from('event_registration')
        .select(`
            *,
            events (*)
        `)
        .eq('user_id', userId);
    if (error) throw error;
    return registrations as event_registration[];
}

export async function isUserRegisteredForEvent(eventId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('event_registration')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
}

export async function unregisterFromEvent(eventId: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from('event_registration')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);
    if (error) throw error;
}

// More detailed event queries
export async function getEventById(eventId: string): Promise<events | null> {
    const { data: event, error } = await supabase
        .from('events')
        .select()
        .eq('id', eventId)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return event as events | null;
}


