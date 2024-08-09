import React, { useState, useEffect } from 'react';
import { createUser, updateUser } from '../service/api';
import '../style/UserForm.css'; // Import the CSS file

interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
}

interface UserFormProps {
  existingUser?: User | null;
  onSave: (user: User) => void;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ existingUser, onSave, onClose }) => {
  const [username, setUsername] = useState(existingUser?.username || '');
  const [email, setEmail] = useState(existingUser?.email || '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingUser) {
      setUsername(existingUser.username);
      setEmail(existingUser.email);
    }
  }, [existingUser]);

  const handleSave = async () => {
    // Basic validation
    const newErrors: string[] = [];
    if (!username) newErrors.push('Username is required.');
    if (!email) newErrors.push('Email is required.');
    if (!existingUser && !password) newErrors.push('Password is required.'); // Only require password for new users

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      let user: User;
      if (existingUser) {
        // Update existing user
        user = await updateUser(existingUser.id, { username, email });
      } else {
        // Create new user
        user = await createUser({ username, email, password });
      }
      onSave(user); // Pass the user object back to the parent component
      onClose();
      setUsername('');
      setEmail('');
      setPassword('');
      setErrors([]);
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors(['An error occurred while saving the user.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-form-container">
      <h2>{existingUser ? 'Edit User' : 'Create User'}</h2>
      <div>
        {errors.length > 0 && (
          <div className="error-message">
            {errors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
      </div>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {!existingUser && (
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      )}
      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : existingUser ? 'Update User' : 'Create User'}
      </button>
    </div>
  );
};

export default UserForm;
