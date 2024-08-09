import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser } from '../service/api';
import UserForm from './UserForm';
import '../style/UserList.css';

interface User {
  id: number;
  username: string;
  email: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getUsers();
        setUsers(userList);
        setLoading(false);
        setError(null)
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
      setUserToDelete(null);
      setShowDeleteModal(false);
      setError(null)
    } catch (error) {
      closeDeleteModal()
      setError('Unable to delete user');
    }
  };

  const handleSave = (savedUser: User) => {
    if (editingUser) {
      setUsers(users.map((user) => (user.id === savedUser.id ? savedUser : user)));
    } else {
      setUsers([...users, savedUser]);
    }
    setShowUserForm(false);
    setEditingUser(null);
    setError(null); // Clear any previous errors
  };

  const openUserForm = (user?: User) => {
    setEditingUser(user || null);
    setShowUserForm(true);
  };

  const closeUserForm = () => {
    setEditingUser(null);
    setShowUserForm(false);
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setShowDeleteModal(false);
  };

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <button onClick={() => openUserForm()}>{showUserForm ? 'Cancel' : 'Add User'}</button>
      </div>
      {loading && <p>Loading users...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && (
        <>
          {showUserForm && (
            <div className="modal">
              <div className="modal-content">
                <span className="close-btn" onClick={closeUserForm}>
                  &times;
                </span>
                <UserForm onSave={handleSave} onClose={closeUserForm} existingUser={editingUser} />
              </div>
            </div>
          )}
          {showDeleteModal && userToDelete && (
            <div className="modal">
              <div className="modal-content">
                <span className="close-btn" onClick={closeDeleteModal}>
                  &times;
                </span>
                <h3>Are you sure you want to delete {userToDelete.username}?</h3>
                <div className="delete-confirm-buttons">
                  <button onClick={() => handleDelete(userToDelete.id)}>Yes, Delete</button>
                  <button onClick={closeDeleteModal}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          <table className="user-list-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="user-list-item">
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <button onClick={() => openUserForm(user)}>Edit</button>
                    <button onClick={() => openDeleteModal(user)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default UserList;
