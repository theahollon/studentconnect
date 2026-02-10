import { createClient } from './client';
import {events, event_registration, job_posting, profiles} from './types';

supabase = createClient();


export const createEvent(data: create_event_input): Promise<events> {
    throw new Error("Not implemented");
};


export const getEvents(){
    throw new Error("Not implemented");
};
export const registerForEvent(eventId, userId): Promise<event_registration> {
    throw new Error("Not implemented");
};
export const createJobPosting(data: create_job_posting_input): Promise<job_posting> {
    throw new Error("Not implemented");

}
export const getJobPosting(){
    throw new Error("Not implemented");
}



