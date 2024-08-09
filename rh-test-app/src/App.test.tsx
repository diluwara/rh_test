import { render, screen } from '@testing-library/react';
import App from './App';

// Mock components used within App if needed
jest.mock('./components/TaskList', () => () => <div>Mock TaskList</div>);
jest.mock('./components/UserList', () => () => <div>Mock UserList</div>);

describe('App Component', () => {
  beforeEach(() => {
    // Suppress console.error for this test suite
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after tests
    jest.restoreAllMocks();
  });

  test('renders the app header', () => {
    render(<App />);
    expect(screen.getByText(/task and user manager/i)).toBeInTheDocument();
  });

  test('renders the UserList and TaskList components', () => {
    render(<App />);
    expect(screen.getByText(/mock tasklist/i)).toBeInTheDocument();
    expect(screen.getByText(/mock userlist/i)).toBeInTheDocument();
  });
});