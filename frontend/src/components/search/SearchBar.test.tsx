import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('shows a live IOC-type badge as the user types a recognizable value', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/search an ioc/i), '8.8.8.8');

    expect(await screen.findByText('IP Address')).toBeInTheDocument();
  });

  it('switches the badge when the value changes to a different recognizable IOC type', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSubmit={vi.fn()} />);
    const input = screen.getByLabelText(/search an ioc/i);

    await user.type(input, '8.8.8.8');
    expect(await screen.findByText('IP Address')).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'example.com');
    expect(await screen.findByText('Domain')).toBeInTheDocument();
    expect(screen.queryByText('IP Address')).not.toBeInTheDocument();
  });

  it('shows an unrecognized-type hint instead of a badge for unclassifiable input', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/search an ioc/i), 'not a valid ioc');

    expect(await screen.findByText(/type not recognized yet/i)).toBeInTheDocument();
  });

  it('submits the trimmed value on submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/search an ioc/i), '  8.8.8.8  ');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSubmit).toHaveBeenCalledWith('8.8.8.8');
  });

  it('disables the submit button while the input is empty', () => {
    render(<SearchBar onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
  });

  it('disables the submit button while loading, even with a value present', () => {
    render(<SearchBar onSubmit={vi.fn()} loading initialValue="8.8.8.8" />);

    expect(screen.getByRole('button', { name: /searching/i })).toBeDisabled();
  });

  it('does not call onSubmit when submitted while loading', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SearchBar onSubmit={onSubmit} loading initialValue="8.8.8.8" />);

    await user.click(screen.getByRole('button', { name: /searching/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
