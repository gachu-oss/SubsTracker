// send-reminder.js
// Sends me an email for every subscription that renews in 2 days.
// How to run it:  node send-reminder.js

import { Resend } from 'resend';
import 'dotenv/config';
import { API_BASE_URL } from './config.js';

const { RESEND_API_KEY, MY_EMAIL } = process.env;

if (!RESEND_API_KEY || !MY_EMAIL) {
  throw new Error('Set RESEND_API_KEY and MY_EMAIL in the root .env file.');
}

// STEP 1: Get the subscriptions from the online backend (same place the website saves them)
const response = await fetch(`${API_BASE_URL}/subscriptions`);
const subscriptions = await response.json();

// STEP 2: Work out the date 2 days from today, written like "2026-11-15"
const date = new Date();
date.setDate(date.getDate() + 2);

const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0'); // months start at 0, so add 1
const day = String(date.getDate()).padStart(2, '0');
const inTwoDays = `${year}-${month}-${day}`;

console.log('Looking for subscriptions that renew on', inTwoDays);

// STEP 3: Keep only the Active subscriptions that renew on that date
const dueSoon = subscriptions.filter(
  (sub) => sub.status === 'Active' && sub.renewal === inTwoDays
);

if (dueSoon.length === 0) {
  console.log('Nothing renews in 2 days. No emails sent.');
}

// STEP 4: Send one email for each subscription found
const resend = new Resend(RESEND_API_KEY);

for (const sub of dueSoon) {
  const { error } = await resend.emails.send({
    from: 'SubsTracker <onboarding@resend.dev>', // "Name <email>" - the name is what people see
    to: MY_EMAIL,
    subject: `Reminder: ${sub.name} renews in 2 days`,
    text: `Your ${sub.name} subscription ($${sub.cost}) renews on ${sub.renewal}.`
  });

  if (error) {
    console.log('Could not send email for', sub.name, '->', error.message);
  } else {
    console.log('Email sent for', sub.name);
  }
}
