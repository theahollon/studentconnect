import { createClient } from './client';
import { buildEventReviewSummary } from '@/lib/event-reviews';
import type {
    events,
    event_registration,
    event_review,
    event_review_with_profile,
    job_postings,
    profiles,
    user_allergies,
    create_event_input,
    create_job_input,
    create_company_input,
    create_event_review_input,
    companies
  } from './types';

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

export async function getEventReviews(eventId: string): Promise<event_review_with_profile[]> {
    const { data: reviews, error } = await supabase
        .from('event_reviews')
        .select(`
            id,
            event_id,
            user_id,
            rating,
            comment,
            created_at,
            updated_at,
            profiles (
                email
            )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (reviews ?? []) as event_review_with_profile[];
}

export async function getEventReviewSummaries(
    eventIds: string[],
): Promise<Record<string, { averageRating: number; reviewCount: number }>> {
    if (eventIds.length === 0) {
        return {};
    }

    const { data: reviews, error } = await supabase
        .from('event_reviews')
        .select('event_id, rating')
        .in('event_id', eventIds);
    if (error) throw error;

    const groupedReviews = new Map<string, Array<{ rating: number }>>();

    for (const review of reviews ?? []) {
        const existing = groupedReviews.get(review.event_id) ?? [];
        existing.push({ rating: review.rating });
        groupedReviews.set(review.event_id, existing);
    }

    return eventIds.reduce<Record<string, { averageRating: number; reviewCount: number }>>(
        (acc, eventId) => {
            const eventReviews = groupedReviews.get(eventId) ?? [];
            acc[eventId] = buildEventReviewSummary(
                eventReviews.map((review, index) => ({
                    id: String(index),
                    event_id: eventId,
                    user_id: '',
                    rating: review.rating,
                    comment: '',
                    created_at: '',
                    updated_at: '',
                    profiles: null,
                })),
            );
            return acc;
        },
        {},
    );
}

export async function getUserEventReview(eventId: string, userId: string): Promise<event_review | null> {
    const { data: review, error } = await supabase
        .from('event_reviews')
        .select()
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return review as event_review | null;
}

export async function upsertEventReview(data: create_event_review_input): Promise<event_review> {
    const { data: review, error } = await supabase
        .from('event_reviews')
        .upsert(data, { onConflict: 'event_id,user_id' })
        .select()
        .single();
    if (error) throw error;
    return review as event_review;
}

export async function createJobListings(data: create_job_input): Promise<job_postings> {
  const { data: job, error } = await supabase.from('job_postings').insert(data).select().single();
  if (error) throw error;
  return job as job_postings;
}

export async function getJobListings(): Promise<job_postings[]> {
    const { data: jobs, error } = await supabase.from('job_postings').select();
    if (error) throw error;
    return jobs as job_postings[];
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

export async function isEventFavorited(eventId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('event_favorites')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
}

export async function toggleEventFavorite(
    eventId: string,
    userId: string
): Promise<boolean> {
    const favorited = await isEventFavorited(eventId, userId);

    if (favorited) {
        const { error } = await supabase
            .from('event_favorites')
            .delete()
            .eq('event_id', eventId)
            .eq('user_id', userId);
        if (error) throw error;
        return false;
    }

    const { error } = await supabase
        .from('event_favorites')
        .insert({
            event_id: eventId,
            user_id: userId,
        });
    if (error) throw error;
    return true;
}

export async function isJobFavorited(jobId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('job_favorites')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', userId)
        .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
}

export async function toggleJobFavorite(
    jobId: string,
    userId: string
): Promise<boolean> {
    const favorited = await isJobFavorited(jobId, userId);

    if (favorited) {
        const { error } = await supabase
            .from('job_favorites')
            .delete()
            .eq('job_id', jobId)
            .eq('user_id', userId);
        if (error) throw error;
        return false;
    }

    const { error } = await supabase
        .from('job_favorites')
        .insert({
            job_id: jobId,
            user_id: userId,
        });
    if (error) throw error;
    return true;
}

export async function getUserFavoriteEvents(userId: string): Promise<events[]> {
    const { data, error } = await supabase
        .from('event_favorites')
        .select(`
            events (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;

    const rows = (data ?? []) as Array<{
        events: events | events[] | null;
    }>;

    return rows
        .map((row) => Array.isArray(row.events) ? row.events[0] ?? null : row.events)
        .filter((event): event is events => !!event);
}

export async function getUserFavoriteJobs(userId: string): Promise<job_postings[]> {
    const { data, error } = await supabase
        .from('job_favorites')
        .select(`
            job_postings (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;

    const rows = (data ?? []) as Array<{
        job_postings: job_postings | job_postings[] | null;
    }>;

    return rows
        .map((row) =>
            Array.isArray(row.job_postings)
                ? row.job_postings[0] ?? null
                : row.job_postings
        )
        .filter((job): job is job_postings => !!job);
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


//AI generated code
export async function deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

    if (error) throw error;
}

export async function getJoblistingById(
    jobId: string
  ): Promise<job_postings | null> {
    const { data: job, error } = await supabase
      .from('job_postings')
      .select()
      .eq('id', jobId)
      .single();
  
    if (error && error.code !== 'PGRST116') throw error;
  
    return job as job_postings | null;
  }

  export async function deleteJoblisting(
    jobId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', jobId);

    if (error) throw error;
  }

export async function getAdminList(): Promise<profiles[]> {
  const { data: admins, error } = await supabase
    .from('profiles')
    .select()
    .eq('role', 'admin');
  if (error) throw error;
  return admins as profiles[];
}

export async function getNonAdminList(): Promise<profiles[]> {
  const { data: users, error } = await supabase
    .from('profiles')
    .select()
    .eq('role', 'user');
  if (error) throw error;
  return users as profiles[];
}

// User Allergies Functions
export async function getUserAllergies(userId: string): Promise<user_allergies[]> {
    const { data: allergies, error } = await supabase
        .from('user_allergies')
        .select()
        .eq('user_id', userId);
    if (error) throw error;
    return allergies as user_allergies[];
}

export async function addUserAllergy(userId: string, allergy: string): Promise<user_allergies> {
    const { data, error } = await supabase
        .from('user_allergies')
        .insert({ user_id: userId, allergy })
        .select()
        .single();
    if (error) throw error;
    return data as user_allergies;
}

export async function removeUserAllergy(allergyId: string): Promise<void> {
    const { error } = await supabase
        .from('user_allergies')
        .delete()
        .eq('id', allergyId);
    if (error) throw error;
}

// Company Functions — Developed with assistance from AI tools.

/** Fetches all companies from the database. */
export async function getCompanies(): Promise<companies[]> {
  const { data: companyList, error } = await supabase.from('companies').select();
  if (error) throw error;
  return companyList as companies[];
}

/** Fetches a single company by its unique name. Returns null if not found. */
export async function getCompanyByName(name: string): Promise<companies | null> {
  const { data: company, error } = await supabase
    .from('companies')
    .select()
    .eq('name', name)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return company as companies | null;
}

/** Fetches all events that belong to a given company (matched by company name). */
export async function getEventsByCompany(companyName: string): Promise<events[]> {
  const { data: eventList, error } = await supabase
    .from('events')
    .select()
    .eq('company', companyName);
  if (error) throw error;
  return eventList as events[];
}

/** Fetches all job postings that belong to a given company (matched by company name). */
export async function getJobListingsByCompany(companyName: string): Promise<job_postings[]> {
  const { data: jobs, error } = await supabase
    .from('job_postings')
    .select()
    .eq('company', companyName);
  if (error) throw error;
  return jobs as job_postings[];
}

export async function createCompanyProfile(data: create_company_input): Promise<companies> {
  const { data: company, error } = await supabase.from('companies').insert(data).select().single();
  if (error) throw error;
  return company as companies;
}

export async function getCompanyById(
    companyId: string
  ): Promise<companies | null> {
    const { data: company, error } = await supabase
      .from('companies')
      .select()
      .eq('id', companyId)
      .single();
  
    if (error && error.code !== 'PGRST116') throw error;
  
    return company as companies | null;
  }

  export async function deleteCompanyProfile(
    companyId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (error) throw error;
  }
