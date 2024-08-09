import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserForm from '../components/UserForm';
import { createUser, updateUser } from '../service/api';

jest.mock('../service/api');

describe('UserForm Component', () => {
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the create user form', () => {
    render(<UserForm onSave={mockOnSave} onClose={mockOnClose} />);

    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
  });

  test('renders the edit user form', () => {
    const existingUser = { id: 1, username: 'Alice', email: 'alice@example.com' };
    render(<UserForm existingUser={existingUser} onSave={mockOnSave} onClose={mockOnClose} />);

    expect(screen.getByPlaceholderText(/username/i)).toHaveValue('Alice');
    expect(screen.getByPlaceholderText(/email/i)).toHaveValue('alice@example.com');
    expect(screen.queryByPlaceholderText(/password/i)).not.toBeInTheDocument(); // Password field should not be present
    expect(screen.getByRole('button', { name: /update user/i })).toBeInTheDocument();
  });

  test('validates form fields', async () => {
    render(<UserForm onSave={mockOnSave} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /create user/i }));

    expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  test('creates a new user', async () => {
    (createUser as jest.Mock).mockResolvedValue({ id: 1, username: 'Bob', email: 'bob@example.com' });

    render(<UserForm onSave={mockOnSave} onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'bob@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /create user/i }));

    await waitFor(() => expect(mockOnSave).toHaveBeenCalledWith({ id: 1, username: 'Bob', email: 'bob@example.com' }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('updates an existing user', async () => {
    const existingUser = { id: 1, username: 'Alice', email: 'alice@example.com' };
    (updateUser as jest.Mock).mockResolvedValue({ id: 1, username: 'AliceUpdated', email: 'aliceupdated@example.com' });

    render(<UserForm existingUser={existingUser} onSave={mockOnSave} onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'AliceUpdated' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'aliceupdated@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /update user/i }));

    await waitFor(() => expect(mockOnSave).toHaveBeenCalledWith({ id: 1, username: 'AliceUpdated', email: 'aliceupdated@example.com' }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('handles errors during save', async () => {
    // Suppress console error messages for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (createUser as jest.Mock).mockRejectedValue(new Error('Failed to create user'));

    render(<UserForm onSave={mockOnSave} onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'bob@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /create user/i }));

    expect(await screen.findByText(/an error occurred while saving the user/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();

    // Restore console error after the test
    consoleErrorSpy.mockRestore();
  });
});
