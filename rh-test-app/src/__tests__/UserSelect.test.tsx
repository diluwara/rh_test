import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserSelect from '../components/UserSelect';
import { getUsers } from '../service/api';

jest.mock('../service/api');

const mockUsers = [
  { id: 1, username: 'Alice', email: 'alice@example.com' },
  { id: 2, username: 'Bob', email: 'bob@example.com' },
];

describe('UserSelect Component', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    // Suppress console.error for this test suite
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after tests
    jest.restoreAllMocks();
  });

  test('renders loading state initially', () => {
    render(<UserSelect onSelect={mockOnSelect} />);

    expect(screen.getByText(/loading users/i)).toBeInTheDocument();
  });

  test('renders error state', async () => {
    (getUsers as jest.Mock).mockRejectedValueOnce(new Error('Failed to load users'));

    render(<UserSelect onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
    });
  });

  test('renders user options when loaded', async () => {
    (getUsers as jest.Mock).mockResolvedValueOnce(mockUsers);

    render(<UserSelect onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    expect(screen.getByText('Select User')).toBeInTheDocument();
    expect(screen.getByText('Alice (alice@example.com)')).toBeInTheDocument();
    expect(screen.getByText('Bob (bob@example.com)')).toBeInTheDocument();
  });

  test('calls onSelect with the selected user ID', async () => {
    (getUsers as jest.Mock).mockResolvedValueOnce(mockUsers);

    render(<UserSelect onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });

    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });

  test('preselects the given user ID', async () => {
    (getUsers as jest.Mock).mockResolvedValueOnce(mockUsers);

    render(<UserSelect selectedUserId={2} onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    expect(screen.getByRole('combobox')).toHaveValue('2');
  });
});
