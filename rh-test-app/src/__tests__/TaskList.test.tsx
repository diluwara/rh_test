import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TaskList from '../components/TaskList';
import { getTasks, deleteTask } from '../service/api';

jest.mock('../service/api');

const mockTasks = [
  { id: 1, title: 'Task 1', user_id: 1 },
  { id: 2, title: 'Task 2', user_id: 2 },
];

describe('TaskList Component', () => {
  const originalError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    (getTasks as jest.Mock).mockResolvedValue(mockTasks);
    (deleteTask as jest.Mock).mockResolvedValue({});

    // Suppress act warnings in console.error
    console.error = (...args) => {
      if (/Warning.*not wrapped in act/.test(args[0])) {
        return;
      }
      originalError.call(console, ...args);
    };
  });

  afterEach(() => {
    // Restore console.error after each test
    console.error = originalError;
  });

  test('renders tasks', async () => {
    await act(async () => {
      render(<TaskList />);
    });

    await waitFor(() => {
      mockTasks.forEach(task => {
        expect(screen.getByText(task.title)).toBeInTheDocument();
      });
    });
  });

  test('opens task form on add button click', async () => {
    await act(async () => {
      render(<TaskList />);
    });

    fireEvent.click(screen.getByText(/add task/i));
    expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
  });

  test('deletes a task', async () => {
    await act(async () => {
      render(<TaskList />);
    });

    await waitFor(() => screen.getByText(mockTasks[0].title));

    fireEvent.click(screen.getAllByText(/delete/i)[0]);

    await waitFor(() => {
      expect(deleteTask).toHaveBeenCalledWith(mockTasks[0].id);
      expect(screen.queryByText(mockTasks[0].title)).not.toBeInTheDocument();
    });
  });

  test('handles errors during delete', async () => {
    (deleteTask as jest.Mock).mockRejectedValue(new Error('Failed to delete task'));

    // Suppress console.error for specific error message during this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
      if (!/Error deleting task:/.test(args[0])) {
        originalError.call(console, ...args);
      }
    });

    await act(async () => {
      render(<TaskList />);
    });

    fireEvent.click(screen.getAllByText(/delete/i)[0]);

    await waitFor(() => {
      expect(screen.getByText(/unable to delete task/i)).toBeInTheDocument();
    });

    // Restore console.error after test
    consoleErrorSpy.mockRestore();
  });
});
