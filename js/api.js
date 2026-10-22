// superbase client  and  Database opps
import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';

// initiating superbase
export const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// authentification 
export function signUpUser(email, password) {
  return client.auth.signUp({ email, password });
}

export function signInUser(email, password) {
  return client.auth.signInWithPassword({ email, password });
}

export function signOutUser() {
  return client.auth.signOut();
}

export function getCurrentSession() {
  return client.auth.getSession();
}

// database CRUD method
export function getSubscriptions() {
  return client
    .from('subscriptions')
    .select('*')
    .order('id', { ascending: false });
}

export function createSubscription(subscriptionData) {
  return client
    .from('subscriptions')
    .insert([subscriptionData]);
}