import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserList from '../components/UserList';
import { getUsers, deleteUser } from '../service/api';

jest.mock('../service/api');

const mockUsers = [
  { id: 1, username: 'Alice', email: 'alice@example.com' },
  { id: 2, username: 'Bob', email: 'bob@example.com' },
];

describe('UserList Component', () => {
  beforeEach(() => {
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);
    (deleteUser as jest.Mock).mockResolvedValue({});
  });

  test('renders users', async () => {
    render(<UserList />);
    expect(screen.getByText(/loading users/i)).toBeInTheDocument();

    await waitFor(() => {
      mockUsers.forEach(user => {
        expect(screen.getByText(user.username)).toBeInTheDocument();
        expect(screen.getByText(user.email)).toBeInTheDocument();
      });
    });
  });

  test('opens user form on add button click', async () => {
    render(<UserList />);
    await waitFor(() => screen.getByText(mockUsers[0].username));

    fireEvent.click(screen.getByText(/add user/i));
    expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
  });

  test('deletes a user', async () => {
    render(<UserList />);
    await waitFor(() => screen.getByText(mockUsers[0].username));

    fireEvent.click(screen.getAllByText(/delete/i)[0]);
    fireEvent.click(screen.getByText(/yes, delete/i));

    await waitFor(() => expect(screen.queryByText(mockUsers[0].username)).not.toBeInTheDocument());
  });
});