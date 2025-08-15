import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders and increments counter', async () => {
    render(<App />);
    const btn = await screen.findByRole('button', { name: /count is/i });
    expect(btn).toBeInTheDocument();
    await userEvent.click(btn);
    expect(btn).toHaveTextContent(/count is 1/i);
  });
});
