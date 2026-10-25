import {
  calculateTotal,
  validateSubscription,
  convertAmount,
  formatCurrency
} from '../js/utils.js';

describe('Utility Functions (utils.js)', () => {
  // 1. Test calculation of total monthly spend
  test('calculateTotal sums up active subscriptions correctly', () => {
    const subs = [
      { name: 'Netflix', cost: 15.00, status: 'Active' },
      { name: 'Spotify', cost: 10.00, status: 'Active' },
      { name: 'Gym', cost: 40.00, status: 'Paused' }
    ];
    expect(calculateTotal(subs)).toBe(25.00);
  });

  test('calculateTotal returns 0 for an empty list', () => {
    expect(calculateTotal([])).toBe(0);
  });

  // 2. Test input validation
  test('validateSubscription returns true for valid input', () => {
    const result = validateSubscription('Netflix', '15.99', '2026-11-15');
    expect(result.isValid).toBe(true);
  });

  test('validateSubscription fails when name is empty', () => {
    const result = validateSubscription('', '10.00', '2026-11-15');
    expect(result.isValid).toBe(false);
  });

  test('validateSubscription fails when cost is zero or negative', () => {
    const zeroResult = validateSubscription('Netflix', '0', '2026-11-15');
    expect(zeroResult.isValid).toBe(false);

    const negResult = validateSubscription('Netflix', '-5', '2026-11-15');
    expect(negResult.isValid).toBe(false);
  });

  test('validateSubscription fails when renewal date is missing', () => {
    const result = validateSubscription('Netflix', '10.00', '');
    expect(result.isValid).toBe(false);
  });

  // 3. Test currency conversion
  test('convertAmount converts USD using provided rates', () => {
    const rates = { KES: 130, EUR: 0.9 };
    expect(convertAmount(10, 'KES', rates)).toBe(1300);
    expect(convertAmount(10, 'USD', rates)).toBe(10);
  });

  // 4. Test currency formatting
  test('formatCurrency formats amounts with appropriate currency symbol', () => {
    expect(formatCurrency(15.99, 'USD')).toBe('$15.99');
    expect(formatCurrency(1000, 'KES')).toBe('KSh 1,000.00');
    expect(formatCurrency(25, 'EUR')).toBe('€25.00');
  });
});
