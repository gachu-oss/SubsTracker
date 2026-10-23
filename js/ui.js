// import calculations from utils.js
import { calculateTotal, convertAmount, formatCurrency } from './utils.js';

// Display ui depending on logged status
export function updateUserView(user, elements) {
  const { authBox, dashboard, userArea, userEmail, subList } = elements;

  if (user) {
    authBox.classList.add('hidden');
    dashboard.classList.remove('hidden');
    userArea.classList.remove('hidden');
    userEmail.textContent = user.email;
  } else {
    authBox.classList.remove('hidden');
    dashboard.classList.add('hidden');
    userArea.classList.add('hidden');
    subList.innerHTML = '';
  }
}

// updates of subscription lists and monthly spend
export function renderSubscriptions(subList, totalSpendEl, subscriptions, filter, currencyCode = 'USD', rates = null) {
  // 1. Calculate and convert total monthly spend
  const baseTotalUSD = calculateTotal(subscriptions);
  const convertedTotal = convertAmount(baseTotalUSD, currencyCode, rates);
  totalSpendEl.textContent = formatCurrency(convertedTotal, currencyCode);

  
  let visible = subscriptions;
  if (filter !== 'all') {
    visible = subscriptions.filter(sub => sub.status === filter);
  }

  // 3. Clear container (THIS WAS MISSING)
  subList.innerHTML = '';

  if (visible.length === 0) {
    subList.innerHTML = '<li class="empty">No subscriptions found.</li>';
    return;
  }

  // 4. Render cards with converted costs
  visible.forEach(item => {
    const convertedCost = convertAmount(item.cost, currencyCode, rates);
    const costText = formatCurrency(convertedCost, currencyCode);

    const li = document.createElement('li');
    li.className = 'sub-item';
    li.innerHTML = `
      <div class="sub-info">
        <strong>${item.name}</strong>
        <span class="sub-meta">${item.category} • Renews ${item.renewal} • <span class="badge ${item.status}">${item.status}</span></span>
      </div>
      <div class="sub-right">
        <span class="cost">${costText}/mo</span>
        <button class="edit-btn" data-id="${item.id}">Edit</button>
        <button class="delete-btn" data-id="${item.id}">Delete</button>
      </div>
    `;
    subList.appendChild(li);
  });
}
