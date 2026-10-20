import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';
import api from '../services/api';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../services/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

function submitForm({ username = 'lucy_demo', email = 'lucy@example.com', password = 'Str0ngPass!234', confirm = 'Str0ngPass!234' } = {}) {
  render(<MemoryRouter><Register /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText(/^username/i), { target: { value: username } });
  fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: password } });
  fireEvent.change(screen.getByLabelText(/^confirm password/i), { target: { value: confirm } });
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));
}

test('shows an error and does not call the API when passwords do not match', () => {
  submitForm({ confirm: 'different-password' });
  expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
  expect(api.post).not.toHaveBeenCalled();
});

test('rejects a password shorter than 8 characters', () => {
  submitForm({ password: 'short', confirm: 'short' });
  expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
  expect(api.post).not.toHaveBeenCalled();
});

test('registers without sending a role, then goes to the login page', async () => {
  api.post.mockResolvedValue({ data: {} });
  submitForm();
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { registered: true } }));
  expect(api.post).toHaveBeenCalledWith('/auth/register', {
    username: 'lucy_demo',
    email: 'lucy@example.com',
    password: 'Str0ngPass!234',
  });
});

test('shows the server message when the username is taken', async () => {
  api.post.mockRejectedValue({ response: { data: { message: 'Username already taken' } } });
  submitForm();
  expect(await screen.findByText('Username already taken')).toBeInTheDocument();
});
