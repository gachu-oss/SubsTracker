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
import { updateUserView, renderSubscriptions, renderCalendar } from './ui.js';

// Application State
let currentUser = null;
let subscriptions = [];
let isSignUp = false;
let currentCurrency = 'USD';
let exchangeRates = null;
let calendarDate = new Date();

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
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

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


async function loadData() {
  const { data, error } = await getSubscriptions();
  if (error) {
    alert('Error loading subscriptions: ' + error.message);
    return;
  }
  subscriptions = data || [];
  refreshList();
}

function refreshList() {
  renderSubscriptions(subList, totalSpend, subscriptions, filterStatus.value, currentCurrency, exchangeRates);
  renderCalendar(subscriptions, calendarDate, currentCurrency, exchangeRates);
}

// Calendar Month Navigation
if (prevMonthBtn) {
  prevMonthBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar(subscriptions, calendarDate, currentCurrency, exchangeRates);
  });
}

if (nextMonthBtn) {
  nextMonthBtn.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar(subscriptions, calendarDate, currentCurrency, exchangeRates);
  });
}

// Currency Selector Listener (Live conversion)
currencySelector.addEventListener('change', (e) => {
  currentCurrency = e.target.value;
  refreshList();
});

// Submit Form (Add or Edit)
subForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = subName.value.trim();
  const cost = subCost.value;
  const renewal = subRenewal.value;

  // Validate using utils.js
  const validation = validateSubscription(name, cost, renewal);
  if (!validation.isValid) {
    alert(validation.message);
    return;
  }

  const payload = {
    name,
    cost: parseFloat(cost),
    category: subCategory.value,
    renewal,
    status: subStatus.value,
    user_id: currentUser.id
  };

  const id = subId.value;
  if (id) {
    // UPDATE
    await updateSubscription(id, payload);
  } else {
    // CREATE
    await createSubscription(payload);
  }

  resetForm();
  await loadData();
});

// Populate Form for Editing
function startEdit(id) {
  const item = subscriptions.find(s => s.id == id);
  if (!item) return;

  subId.value = item.id;
  subName.value = item.name;
  subCost.value = item.cost;
  subCategory.value = item.category;
  subRenewal.value = item.renewal;
  subStatus.value = item.status;

  formTitle.textContent = 'Edit Subscription';
  saveBtn.textContent = 'Update Subscription';
  cancelBtn.classList.remove('hidden');
}

// Reset Form
function resetForm() {
  subForm.reset();
  subId.value = '';
  formTitle.textContent = 'Add Subscription';
  saveBtn.textContent = 'Save Subscription';
  cancelBtn.classList.add('hidden');
}

cancelBtn.addEventListener('click', resetForm);

// Handle Edit & Delete button clicks via delegation
subList.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('edit-btn')) {
    startEdit(id);
  } else if (e.target.classList.contains('delete-btn')) {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    await deleteSubscription(id);
    await loadData();
  }
});

// Filter dropdown change
filterStatus.addEventListener('change', refreshList);

// Check Session on page load
getCurrentSession().then(({ data }) => {
  if (data?.session) {
    setUser(data.session.user);
  }
});
