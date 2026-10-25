
export function calculateTotal(subscriptions) {
  if (!Array.isArray(subscriptions)) return 0;
  let total = 0;
  subscriptions.forEach(sub => {
    if (sub && sub.status === 'Active') {
      const cost = parseFloat(sub.cost);
      total += isNaN(cost) ? 0 : cost;
    }
  });
  return total;
}


export function validateSubscription(name, cost, renewal) {
  if (!name || name.trim() === '') {
    return { isValid: false, message: 'Please enter a subscription service name.' };
  }
  const parsedCost = parseFloat(cost);
  if (isNaN(parsedCost) || parsedCost <= 0) {
    return { isValid: false, message: 'Please enter a valid positive cost.' };
  }
  if (!renewal) {
    return { isValid: false, message: 'Please select a renewal date.' };
  }
  return { isValid: true };
}


export function convertAmount(amountInUSD, currencyCode, rates) {
  const num = parseFloat(amountInUSD) || 0;
  if (!rates || !rates[currencyCode] || currencyCode === 'USD') {
    return num;
  }
  return num * rates[currencyCode];
}


export function formatCurrency(amount, currencyCode = 'USD') {
  const num = parseFloat(amount) || 0;
  const symbols = {
    USD: '$',
    KES: 'KSh ',
    EUR: '€',
    GBP: '£'
  };
  const prefix = symbols[currencyCode] || `${currencyCode} `;
  return `${prefix}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
