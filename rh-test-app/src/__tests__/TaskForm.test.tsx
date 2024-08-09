import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskForm from '../components/TaskForm';
import { createTask, updateTask, getUsers } from '../service/api';

jest.mock('../service/api');

const mockUsers = [
  { id: 1, username: 'Alice', email: 'alice@example.com' },
  { id: 2, username: 'Bob', email: 'bob@example.com' },
];

describe('TaskForm Component', () => {
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();

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

  test('renders the create task form', async () => {
    render(<TaskForm onSave={mockOnSave} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /completed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  test('validates form fields', async () => {
    render(<TaskForm onSave={mockOnSave} onClose={mockOnClose} />);

    await waitFor(() => screen.getByRole('combobox'));

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/user selection is required/i)).toBeInTheDocument();
    });
  });

  test('creates a new task', async () => {
    (createTask as jest.Mock).mockResolvedValueOnce({ id: 2, title: 'New Task', user_id: 1 });

    render(<TaskForm onSave={mockOnSave} onClose={mockOnClose} />);

    await waitFor(() => screen.getByRole('combobox'));

    fireEvent.change(screen.getByPlaceholderText(/title/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith({ title: 'New Task', description: '', user_id: 1 });
      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('updates an existing task', async () => {
    const task = { id: 1, title: 'Task 1', description: '', completed: false, user_id: 1 };
    (updateTask as jest.Mock).mockResolvedValueOnce(task);

    render(<TaskForm task={task} onSave={mockOnSave} onClose={mockOnClose} />);

    await waitFor(() => screen.getByRole('combobox'));

    fireEvent.change(screen.getByPlaceholderText(/title/i), { target: { value: 'Updated Task' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledWith(1, { title: 'Updated Task', description: '', completed: false });
      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('handles errors during save', async () => {
    (createTask as jest.Mock).mockRejectedValueOnce(new Error('Failed to create task'));

    render(<TaskForm onSave={mockOnSave} onClose={mockOnClose} />);

    await waitFor(() => screen.getByRole('combobox'));

    fireEvent.change(screen.getByPlaceholderText(/title/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/error saving task/i)).toBeInTheDocument();
    });
  });
});