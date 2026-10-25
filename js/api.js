// api.js - Supabase Authentication & REST API Operations (GET, POST, PUT, PATCH, DELETE)
import { SUPABASE_URL, SUPABASE_KEY, API_BASE_URL, EXCHANGE_RATE_API_KEY } from '../config.js';


 
export const client = typeof window !== 'undefined' && window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

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

// ==========================================
// 2. REST API CRUD (GET, POST, PUT, PATCH, DELETE)
// ==========================================
const API_URL = `${API_BASE_URL}/subscriptions`;

// GET: Fetch all subscriptions
export async function getSubscriptions() {
  const response = await fetch(API_URL);
  return await response.json();
}

// POST: Add a new subscription
export async function createSubscription(subscriptionData) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscriptionData)
  });
  return await response.json();
}

// PUT: Update an entire subscription
export async function updateSubscription(id, subscriptionData) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscriptionData)
  });
  return await response.json();
}

// PATCH: Update only the status (Active or Paused)
export async function patchSubscriptionStatus(id, newStatus) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });
  return await response.json();
}

// DELETE: Remove a subscription
export async function deleteSubscription(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  return await response.json();
}

// ==========================================
// 3. CURRENCY RATES (External API)
// ==========================================
export async function fetchExchangeRates() {
  const url = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/USD`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch exchange rates');
  }
  const data = await response.json();
  return data.conversion_rates;
}
