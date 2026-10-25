import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  patchSubscriptionStatus,
  deleteSubscription
} from '../js/api.js';

describe('API functions (api.js)', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  test('getSubscriptions makes a GET request and returns data', async () => {
    const mockData = [{ id: 1, name: 'Netflix', cost: 15.99 }];
    global.fetch.mockResolvedValueOnce({
      json: async () => mockData
    });

    const data = await getSubscriptions();
    expect(data).toEqual(mockData);
  });

  test('createSubscription sends a POST request', async () => {
    const newSub = { name: 'Spotify', cost: 9.99 };
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ id: 2, ...newSub })
    });

    const result = await createSubscription(newSub);
    expect(result.name).toBe('Spotify');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/subscriptions'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  test('updateSubscription sends a PUT request', async () => {
    const updated = { id: 1, name: 'Netflix 4K', cost: 22.99 };
    global.fetch.mockResolvedValueOnce({
      json: async () => updated
    });

    const result = await updateSubscription(1, updated);
    expect(result.name).toBe('Netflix 4K');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/subscriptions/1'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  test('patchSubscriptionStatus sends a PATCH request', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ id: 1, status: 'Paused' })
    });

    const result = await patchSubscriptionStatus(1, 'Paused');
    expect(result.status).toBe('Paused');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/subscriptions/1'),
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  test('deleteSubscription sends a DELETE request', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({})
    });

    await deleteSubscription(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/subscriptions/1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
