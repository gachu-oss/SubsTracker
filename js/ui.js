// ui.js - DOM Rendering and UI Display Helpers
import { calculateTotal, convertAmount, formatCurrency } from './utils.js';

/**
 * Updates the screen depending on whether a user is logged in
 */
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

/**
 * Renders the subscription list items and updates total monthly spend
 */
export function renderSubscriptions(subList, totalSpendEl, subscriptions, filter, currencyCode = 'USD', rates = null) {
  // 1. Calculate and convert total monthly spend
  const baseTotalUSD = calculateTotal(subscriptions);
  const convertedTotal = convertAmount(baseTotalUSD, currencyCode, rates);
  totalSpendEl.textContent = formatCurrency(convertedTotal, currencyCode);

  // 2. Filter list
  let visible = subscriptions;
  if (filter !== 'all') {
    visible = subscriptions.filter(sub => sub.status === filter);
  }

  // 3. Clear container before rendering new items
  subList.innerHTML = '';

  if (visible.length === 0) {
    subList.innerHTML = '<li class="empty">No subscriptions found.</li>';
    return;
  }

  // 4. Render cards with converted costs
  visible.forEach(item => {
    const convertedCost = convertAmount(item.cost, currencyCode, rates);
    const costText = formatCurrency(convertedCost, currencyCode);
    const toggleText = item.status === 'Active' ? 'Pause' : 'Activate';
    const nextStatus = item.status === 'Active' ? 'Paused' : 'Active';

    const li = document.createElement('li');
    li.className = 'sub-item';
    li.innerHTML = `
      <div class="sub-info">
        <strong>${item.name}</strong>
        <span class="sub-meta">${item.category} • Renews ${item.renewal} • <span class="badge ${item.status}">${item.status}</span></span>
      </div>
      <div class="sub-right">
        <span class="cost">${costText}/mo</span>
        <button class="toggle-btn" data-id="${item.id}" data-next-status="${nextStatus}">${toggleText}</button>
        <button class="edit-btn" data-id="${item.id}">Edit</button>
        <button class="delete-btn" data-id="${item.id}">Delete</button>
      </div>
    `;
    subList.appendChild(li);
  });
}

/**
 * Renders the Monthly Renewal Calendar
 * - Allows navigating between months
 * - Highlights days in green that have active subscriptions renewing in the viewed month
 * - Clicking any day displays its subscription renewals
 * - Displays a clear monthly breakdown of all renewals
 * - Shows the next upcoming subscription due date relative to today
 */
export function renderCalendar(subscriptions, viewDate = new Date(), currencyCode = 'USD', rates = null) {
  const calTitle = document.getElementById('calMonthTitle');
  const calDays = document.getElementById('calendarDays');
  const calDetails = document.getElementById('calDetails');
  const nextNotice = document.getElementById('nextDueNotice');

  if (!calDays) return;

  // Viewed month and year
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth(); // 0-indexed (0 = Jan, 11 = Dec)

  // Actual today for comparisons
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  // Month names for the calendar title
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (calTitle) {
    calTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }

  // Calculate days in the viewed month and the weekday of day 1
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  // Clear previous calendar days
  calDays.innerHTML = '';

  // Filter to active subscriptions only
  const activeSubs = subscriptions.filter(sub => sub.status === 'Active');

  // Map active subscriptions to their renewal day in this specific month
  const renewalMap = {};
  const monthRenewalsList = [];

  activeSubs.forEach(sub => {
    if (sub.renewal) {
      const parts = sub.renewal.split('-');
      const subYear = parseInt(parts[0], 10);
      const subMonth = parseInt(parts[1], 10) - 1; // 0-indexed
      const subDay = parseInt(parts[2], 10);

      // Only show if the subscription started on or before the currently viewed month
      const isStarted = currentYear > subYear || (currentYear === subYear && currentMonth >= subMonth);

      if (isStarted && !isNaN(subDay)) {
        // Adjust for months with fewer days (e.g., day 31 in a 30-day month)
        const effectiveDay = Math.min(subDay, totalDays);
        if (!renewalMap[effectiveDay]) {
          renewalMap[effectiveDay] = [];
        }
        renewalMap[effectiveDay].push(sub);

        monthRenewalsList.push({
          day: effectiveDay,
          sub
        });
      }
    }
  });

  // Sort month renewals by day
  monthRenewalsList.sort((a, b) => a.day - b.day);

  // Helper function to render monthly renewal schedule
  function showMonthSummary() {
    if (!calDetails) return;

    if (monthRenewalsList.length === 0) {
      calDetails.innerHTML = `<p class="cal-empty-hint">No subscriptions due in ${monthNames[currentMonth]} ${currentYear}.</p>`;
    } else {
      const itemsHtml = monthRenewalsList.map(({ day, sub }) => {
        const converted = convertAmount(sub.cost, currencyCode, rates);
        const costStr = formatCurrency(converted, currencyCode);
        return `
          <div class="cal-renewal-item">
            <div>
              <span class="cal-date-tag">${monthNames[currentMonth].slice(0, 3)} ${day}</span>
              <strong>${sub.name}</strong>
              <span style="color:#94a3b8;font-size:12px;"> (${sub.category})</span>
            </div>
            <span class="cost" style="margin:0;">${costStr}/mo</span>
          </div>
        `;
      }).join('');

      calDetails.innerHTML = `
        <div class="cal-details-header">
          <span>Renewals in ${monthNames[currentMonth]} (${monthRenewalsList.length})</span>
          <span style="font-weight:normal;color:#64748b;text-transform:none;">Click a date to focus</span>
        </div>
        <div class="cal-renewal-list">${itemsHtml}</div>
      `;
    }
  }

  // Display month summary by default
  showMonthSummary();

  // 1. Add empty placeholder tiles for alignment before day 1
  for (let i = 0; i < firstDayIndex; i++) {
    const blank = document.createElement('div');
    blank.className = 'cal-day empty';
    calDays.appendChild(blank);
  }

  // 2. Add day tiles for the month (1 to totalDays)
  for (let day = 1; day <= totalDays; day++) {
    const cell = document.createElement('div');
    cell.className = 'cal-day';
    cell.textContent = day;

    // Highlight today's date if viewing current month
    if (currentYear === todayYear && currentMonth === todayMonth && day === todayDay) {
      cell.classList.add('today');
    }

    // Check if this day is a renewal date
    if (renewalMap[day]) {
      cell.classList.add('renewal-day');
      const names = renewalMap[day].map(s => s.name).join(', ');
      cell.title = `Renews: ${names}`;
    }

    // Clicking on any date inspects that day's renewals
    cell.addEventListener('click', () => {
      document.querySelectorAll('.cal-day.selected').forEach(el => el.classList.remove('selected'));
      cell.classList.add('selected');

      if (!calDetails) return;

      const daySubs = renewalMap[day];
      if (daySubs && daySubs.length > 0) {
        const itemsHtml = daySubs.map(sub => {
          const converted = convertAmount(sub.cost, currencyCode, rates);
          const costStr = formatCurrency(converted, currencyCode);
          return `
            <div class="cal-renewal-item">
              <div>
                <strong>${sub.name}</strong>
                <span style="color:#94a3b8;font-size:12px;"> • ${sub.category}</span>
              </div>
              <span class="cost" style="margin:0;">${costStr}/mo</span>
            </div>
          `;
        }).join('');

        calDetails.innerHTML = `
          <div class="cal-details-header">
            <span>📅 ${monthNames[currentMonth]} ${day}, ${currentYear}</span>
            <button type="button" class="link-action-btn" id="showAllMonthBtn">View all</button>
          </div>
          <div class="cal-renewal-list">${itemsHtml}</div>
        `;
        document.getElementById('showAllMonthBtn')?.addEventListener('click', () => {
          cell.classList.remove('selected');
          showMonthSummary();
        });
      } else {
        calDetails.innerHTML = `
          <div class="cal-details-header">
            <span>📅 ${monthNames[currentMonth]} ${day}, ${currentYear}</span>
            <button type="button" class="link-action-btn" id="showAllMonthBtn">View all</button>
          </div>
          <p class="cal-empty-hint">No subscriptions renew on this date.</p>
        `;
        document.getElementById('showAllMonthBtn')?.addEventListener('click', () => {
          cell.classList.remove('selected');
          showMonthSummary();
        });
      }
    });

    calDays.appendChild(cell);
  }

  // 3. Calculate and display the next due subscription relative to today's date
  if (nextNotice) {
    if (activeSubs.length === 0) {
      nextNotice.innerHTML = '<em>No active subscriptions scheduled.</em>';
    } else {
      // Find the next upcoming renewal date for each active subscription
      const subsWithNextDate = activeSubs.map(sub => {
        const parts = sub.renewal.split('-');
        const day = parseInt(parts[2], 10);
        let nextDate = new Date(todayYear, todayMonth, day);

        // If the day already passed this month, the next renewal is next month
        if (day < todayDay) {
          nextDate = new Date(todayYear, todayMonth + 1, day);
        }
        return { sub, nextDate, day };
      });

      // Sort to find the nearest due date
      subsWithNextDate.sort((a, b) => a.nextDate - b.nextDate);
      const nearest = subsWithNextDate[0];

      const isDueToday = nearest.day === todayDay;
      const dateFormatted = nearest.nextDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });

      const converted = convertAmount(nearest.sub.cost, currencyCode, rates);
      const costStr = formatCurrency(converted, currencyCode);

      nextNotice.innerHTML = `<strong>Next Due:</strong> ${nearest.sub.name} (${costStr}) • ${isDueToday ? '<span style="color:#10b981;font-weight:bold;">Due Today!</span>' : 'Due ' + dateFormatted}`;
    }
  }
}
