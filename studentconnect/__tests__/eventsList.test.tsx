/**
 * Unit tests for the EventsList component.
 * 
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { jest, test } from '@jest/globals';
import EventsList from '@/app/events/eventsList';

jest.mock('@/lib/supabase/database', () => ({
  getEvents: jest.fn(),
}));
const { getEvents } = require('@/lib/supabase/database');

test('renders events as links', async () => {
  getEvents.mockResolvedValue([
    { id: '1', title: 'Event A', slug: 'event-a' },
    { id: '2', title: 'Event B' }, // falls back to id
  ]);

  render(await EventsList());

  expect(screen.getByRole('link', { name: /Event A/i })).toHaveAttribute('href', '/events/event-a');
  expect(screen.getByRole('link', { name: /Event B/i })).toHaveAttribute('href', '/events/2');
});

test('shows a readable error message', async () => {
  getEvents.mockRejectedValue(new Error('Invalid API key'));
  render(await EventsList());
  expect(screen.getByText(/Error loading events:/)).toHaveTextContent('Invalid API key');
});