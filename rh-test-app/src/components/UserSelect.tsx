import React, { useEffect, useState } from 'react';
import { getUsers } from '../service/api';
import '../style/UserSelect.css' // Ensure you import the CSS file

interface User {
  id: number;
  username: string;
  email: string;
}

interface UserSelectProps {
  selectedUserId?: number; // Added selectedUserId prop
  onSelect: (userId: number) => void;
}

const UserSelect: React.FC<UserSelectProps> = ({ selectedUserId, onSelect }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getUsers();
        setUsers(userList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="user-select-container">
      {loading && <p className="loading-text">Loading users...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && (
        <select
          className="user-select-dropdown"
          value={selectedUserId || ''}
          onChange={(e) => onSelect(Number(e.target.value))}
        >
          <option value="">Select User</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.username} ({user.email})
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default UserSelect;
