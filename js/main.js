// main.js - Application Controller & Event Coordination
// Connects api.js, utils.js, and ui.js

import {
  signUpUser,
  signInUser,
  signOutUser,
  getCurrentSession,
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  fetchExchangeRates
} from './api.js';

import { validateSubscription } from './utils.js';
import { updateUserView, renderSubscriptions } from './ui.js';

// Application State
let currentUser = null;
let subscriptions = [];
let isSignUp = false;
let currentCurrency = 'USD';
let exchangeRates = null;

// DOM Elements
const authBox = document.getElementById('authBox');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authBtn = document.getElementById('authBtn');
const toggleAuth = document.getElementById('toggleAuth');
const authToggleHint = document.getElementById('authToggleHint');
const authMsg = document.getElementById('authMsg');

const dashboard = document.getElementById('dashboard');
const userArea = document.getElementById('userArea');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

const subForm = document.getElementById('subForm');
const subId = document.getElementById('subId');
const subName = document.getElementById('subName');
const subCost = document.getElementById('subCost');
const subCategory = document.getElementById('subCategory');
const subRenewal = document.getElementById('subRenewal');
const subStatus = document.getElementById('subStatus');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');

const subList = document.getElementById('subList');
const filterStatus = document.getElementById('filterStatus');
const totalSpend = document.getElementById('totalSpend');
const currencySelector = document.getElementById('currencySelector');

const uiElements = { authBox, dashboard, userArea, userEmail, subList };

// ===================================================
// 1. AUTHENTICATION CONTROLLER
// ===================================================

// Toggle between Sign In and Sign Up
toggleAuth.addEventListener('click', () => {
  isSignUp = !isSignUp;
  if (isSignUp) {
    authTitle.textContent = 'Create an Account';
    authSubtitle.textContent = 'Sign up to start tracking your subscriptions with Supabase cloud';
    authBtn.textContent = 'Create Account';
    authToggleHint.textContent = 'Already have an account?';
    toggleAuth.textContent = 'Sign in instead';
  } else {
    authTitle.textContent = 'Welcome Back';
    authSubtitle.textContent = 'Sign in to manage and monitor your daily recurring subscriptions';
    authBtn.textContent = 'Sign In';
    authToggleHint.textContent = "Don't have an account yet?";
    toggleAuth.textContent = 'Create one now';
  }
  authMsg.classList.add('hidden');
});

// Handle Login or Registration
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  let res;
  if (isSignUp) {
    res = await signUpUser(email, password);
  } else {
    res = await signInUser(email, password);
  }

  if (res.error) {
    authMsg.textContent = res.error.message;
    authMsg.className = 'message error';
    authMsg.classList.remove('hidden');
  } else {
    setUser(res.data.user);
  }
});

// Logout
logoutBtn.addEventListener('click', async () => {
  await signOutUser();
  setUser(null);
});

// Update User & Load Data
async function setUser(user) {
  currentUser = user;
  updateUserView(user, uiElements);
  if (user) {
    // Load live exchange rates using ExchangeRate-API
    if (!exchangeRates) {
      try {
        exchangeRates = await fetchExchangeRates();
      } catch (err) {
        console.warn('Could not load live rates, defaulting to 1:1:', err);
      }
    }
    loadData();
  }
}