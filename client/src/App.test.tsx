import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders correctly and shows main text', () => {
    render(<App />);
    const heading = screen.getByText(/Get started/i);
    expect(heading).toBeInTheDocument();
  });
});
