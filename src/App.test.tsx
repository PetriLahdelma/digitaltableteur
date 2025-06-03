import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the home page title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Welcome to Digitaltableteur/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders the grid items', () => {
  render(<App />);
  const gridItems = screen.getAllByRole('gridcell');
  expect(gridItems.length).toBeGreaterThan(0);
});
