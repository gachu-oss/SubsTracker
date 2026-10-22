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

export function updateSubscription(id, subscriptionData) {
  return client
    .from('subscriptions')
    .update(subscriptionData)
    .eq('id', id);
} 

export function deleteSubscription(id) {
  return client
    .from('subscriptions')
    .delete()
    .eq('id', id);
}

// fetch live currency rates from ExchangeRate-API

import { EXCHANGE_RATE_API_KEY } from '../config.js';

export async function fetchExchangeRates() {
  const url = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/USD`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch exchange rates');
  }
  const data = await response.json();
  return data.conversion_rates;
}