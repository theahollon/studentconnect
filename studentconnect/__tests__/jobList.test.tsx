/**
 * Unit tests for the JobList component.
 * 
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import { render, screen } from '@testing-library/react';
import { jest, test} from '@jest/globals';
import JobList from '@/app/joblistings/jobList';

jest.mock('@/lib/supabase/database', () => ({
  getJobListings: jest.fn(),
}));
const { getJobListings } = require('@/lib/supabase/database');

test('renders job listings as links', async () => {
  getJobListings.mockResolvedValue([
    { id: 'j1', title: 'Frontend Dev', slug: 'frontend-dev' },
    { id: 'j2', title: 'Backend Dev' },
  ]);

  render(await JobList());

  expect(screen.getByRole('link', { name: /Frontend Dev/i })).toHaveAttribute('href', '/joblistings/frontend-dev');
  expect(screen.getByRole('link', { name: /Backend Dev/i })).toHaveAttribute('href', '/joblistings/j2');
});

test('shows a readable error message', async () => {
  getJobListings.mockRejectedValue(new Error('Could not find the table'));
  render(await JobList());
  expect(screen.getByText(/Error loading job listings:/)).toHaveTextContent('Could not find the table');
});